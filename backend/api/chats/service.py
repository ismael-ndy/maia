from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, AsyncIterator, Dict

from backboard import BackboardClient
from backboard.exceptions import BackboardAPIError
from sqlalchemy.ext.asyncio import AsyncSession

from api.chats.models import ThreadMessage
from api.chats.tools import TOOLS
from api.config import BACKBOARD_API_KEY
from api.security.models import TokenData
from api.therapists.models import ReportMessage
from api.users.models import Patient, Role
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
    user_info: TokenData,
    content: str,
) -> AsyncIterator[Dict[str, Any]]:
    if user_info.role == Role.THERAPIST:
        raise PermissionDenied("Therapist cannot send messages")

    if not user_info.thread_id:
        raise InvalidRequest("User does not have an assigned thread")

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
                elif chunk_type == "tool_call":
                    # TODO: handle guardian_check / suggest_exercise
                    pass

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
