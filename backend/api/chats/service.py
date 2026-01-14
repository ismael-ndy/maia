import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, AsyncIterator, Dict

from backboard import BackboardClient
from backboard.exceptions import BackboardAPIError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.chats.models import ThreadMessage
from api.chats.tools import TOOLS, guardian_check
from api.config import BACKBOARD_API_KEY
from api.security.models import TokenData
from api.therapists.models import ReportMessage
from api.users.models import LinkStatus, Patient, PatientLink, Role
from api.users.service import InvalidRequest, PermissionDenied

SYSTEM_PROMPT = Path("prompts/system_prompt_v1.txt").read_text()
KB_FILES_DIR = Path("knowledge_docs")


async def create_user_assistant(user_id: int) -> str:
    """
    Creates a Backboard assistant for a user.
    Returns assistant_id.
    """
    async with BackboardClient(api_key=BACKBOARD_API_KEY) as client:  # type: ignore
        assistant = await client.create_assistant(
            name=f"user-{user_id}",
            description=SYSTEM_PROMPT,
            tools=TOOLS,
        )

        for path in KB_FILES_DIR.iterdir():
            await client.upload_document_to_assistant(
                assistant_id=assistant.assistant_id,
                file_path=path,
            )

        return str(assistant.assistant_id)


async def create_user_thread(assistant_id: str) -> str:
    """
    Creates a thread for a user.
    """
    async with BackboardClient(api_key=BACKBOARD_API_KEY) as client:  # type: ignore
        thread = await client.create_thread(assistant_id)
        return str(thread.thread_id)


async def create_patient(session: AsyncSession, user_id: int) -> str:
    """
    Create a patient with its own assistant and thread
    Return the patient's thread ID
    """
    assistant_id = await create_user_assistant(user_id)
    thread_id = await create_user_thread(assistant_id)
    report_thread_id = await create_user_thread(assistant_id)

    patient = Patient(
        user_id=user_id,
        assistant_id=assistant_id,
        thread_id=thread_id,
        report_thread_id=report_thread_id,
    )

    try:
        session.add(patient)
        await session.commit()
    except:
        await session.rollback()
        raise

    await session.refresh(patient)
    return str(patient.thread_id)


async def stream_message(
    session: AsyncSession,
    user_info: TokenData,
    content: str,
) -> AsyncIterator[Dict[str, Any]]:
    if user_info.role == Role.THERAPIST:
        raise PermissionDenied("Therapist cannot send messages")

    if not user_info.thread_id:
        raise InvalidRequest("User does not have an assigned thread")

    # Get therapist_id for this patient
    link_result = await session.execute(
        select(PatientLink.therapist_id).where(
            PatientLink.patient_id == user_info.user_id,
            PatientLink.link_status == LinkStatus.ACCEPTED,
        )
    )
    therapist_id = link_result.scalar_one_or_none()

    try:
        async with BackboardClient(api_key=BACKBOARD_API_KEY) as client:  # type: ignore
            stream = await client.add_message(
                thread_id=str(user_info.thread_id),
                content=content,
                memory="Auto",
                stream=True,
            )

            async for chunk in stream:
                chunk_type = chunk.get("type")

                if chunk_type == "content_streaming":
                    yield {"type": "content", "content": chunk.get("content", "")}
                elif chunk_type == "message_complete":
                    break
                elif chunk_type == "tool_submit_required":
                    run_id = chunk["run_id"]
                    tool_calls = chunk["tool_calls"]

                    tool_outputs = []
                    for tc in tool_calls:
                        function_name = tc["function"]["name"]
                        function_args = json.loads(tc["function"]["arguments"])

                        if function_name == "guardian_check":
                            risk_level = function_args.get("risk_level", "low")
                            cause = function_args.get("cause") or f"Safety concern detected - {risk_level} risk level"
                            
                            result = await guardian_check(
                                session=session,
                                therapist_id=therapist_id or 0,
                                patient_id=user_info.user_id,
                                risk_level=risk_level,
                                cause=cause,
                            )

                            tool_outputs.append({
                                "tool_call_id": tc["id"],
                                "output": json.dumps(result),
                            })

                    # Submit tool outputs and stream the final response
                    async for tool_chunk in await client.submit_tool_outputs(
                        thread_id=str(user_info.thread_id),
                        run_id=run_id,
                        tool_outputs=tool_outputs,
                        stream=True,
                    ):
                        if tool_chunk["type"] == "content_streaming":
                            yield {"type": "content", "content": tool_chunk.get("content", "")}
                        elif tool_chunk["type"] == "message_complete":
                            break

    except BackboardAPIError as e:
        raise InvalidRequest(f"Chat service error: {str(e)}")


async def get_thread_messages(thread_id: str) -> list[ThreadMessage]:
    """
    Return the messages of the patient's thread
    with format:
        {timestamp: datetime, content: str}
    """
    try:
        async with BackboardClient(api_key=BACKBOARD_API_KEY) as client:  # type: ignore
            thread = await client.get_thread(thread_id)

            messages = thread.messages or []
            messages_sorted = sorted(messages, key=lambda m: m.created_at, reverse=False)

            return [
                ThreadMessage(timestamp=m.created_at, content=m.content, role=m.role)  # type: ignore
                for m in messages_sorted
            ]

    except BackboardAPIError as e:
        raise InvalidRequest(f"Chat service error: {str(e)}")


def filter_last_week(messages: list[ThreadMessage]):
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)

    def to_utc(dt: datetime) -> datetime:
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)

    return [m for m in messages if to_utc(m.timestamp) >= cutoff]


def build_weekly_report_prompt(messages: list[ThreadMessage]) -> str:
    formatted = "\n".join(f"[{m.timestamp.isoformat()}] {m.content}" for m in messages)

    return f"""
You are generating a clinical-style weekly summary for a therapist.

Rules:
- Be factual and neutral.
- Do not diagnose.
- Do not invent information.
- Highlight themes, emotional patterns, progress, and risks.
- If no risks are present, explicitly say so.

Conversation from the last 7 days:
{formatted}

Produce the report with the following sections:
1. Overview
2. Main Themes
3. Emotional Trends
4. Progress / Improvements
5. Risks or Alerts
6. Suggested Focus for Next Week
"""


async def generate_weekly_report(
    thread_id: str, report_thread_id: str, patient_id: int
) -> ReportMessage:
    messages = await get_thread_messages(thread_id)
    last_week = filter_last_week(messages)

    if not last_week:
        return ReportMessage(
            content="No patient activity in the last 7 days.",
            patient_id=patient_id,
            created_at=datetime.now(timezone.utc),
        )

    prompt = build_weekly_report_prompt(last_week)

    async with BackboardClient(api_key=BACKBOARD_API_KEY) as client:  # type:ignore
        response = await client.add_message(
            thread_id=report_thread_id,
            content=prompt,
            memory="off",
            stream=False,
        )

    return ReportMessage(
        content=response.content,
        patient_id=patient_id,
        created_at=response.created_at,
    )
