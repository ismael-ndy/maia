from pathlib import Path
from typing import Any, AsyncIterator, Dict
from uuid import UUID

from backboard import BackboardClient
from backboard.exceptions import BackboardAPIError
from sqlalchemy.ext.asyncio import AsyncSession

from api.chats.tools import TOOLS
from api.config import BACKBOARD_API_KEY
from api.security.models import TokenData
from api.users.models import Patient, Role
from api.users.service import InvalidRequest, PermissionDenied

SYSTEM_PROMPT = Path("prompts/system_prompt_v1.txt").read_text()
KB_FILES = []


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

        for path in KB_FILES:
            await client.upload_document_to_assistant(
                assistant_id=assistant.assistant_id,
                file_path=path,
            )

        return str(assistant.assistant_id)


async def create_user_thread(assistant_id: str) -> str:
    """
    Creates the single persistent thread for a user.
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

    patient = Patient(user_id=user_id, assistant_id=assistant_id, thread_id=thread_id)

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
                if chunk.get("type") == "tool_call":
                    # TODO: handle guardian_check / suggest_exercise
                    pass
                yield chunk

    except BackboardAPIError as e:
        raise InvalidRequest(f"Chat service error: {str(e)}")
