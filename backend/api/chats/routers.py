import json

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from api.chats.models import SendMessageRequest, ThreadMessage
from api.chats.service import get_thread_messages, stream_message
from api.security.service import USER_INFO_DEP
from api.users.models import Role
from api.users.service import InvalidRequest, PermissionDenied

router = APIRouter(prefix="/chats", tags=["Chats"])


@router.post(
    "/messages/stream",
    summary="Stream assistant responses",
    description="Streams assistant events as Server-Sent Events (SSE)",
    responses={
        200: {"content": {"text/event-stream": {}}, "description": "Streaming response"}
    },
)
async def stream_message_route(
    payload: SendMessageRequest,
    user_info: USER_INFO_DEP,
):
    """
    Stream assistant responses for the authenticated user.
    """

    async def event_generator():
        try:
            async for event in stream_message(
                user_info=user_info,
                content=payload.content,
            ):
                yield f"data: {json.dumps(event)}\n\n"
            
            # Signal completion
            yield "data: [DONE]\n\n"

        except PermissionDenied as e:
            yield f'data: {json.dumps({"type": "error", "message": str(e)})}\n\n'

        except InvalidRequest as e:
            yield f'data: {json.dumps({"type": "error", "message": str(e)})}\n\n'

        except Exception as _:
            yield f'data: {json.dumps({"type": "error", "message": "Internal server error"})}\n\n'

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )


@router.get(
    "/messages",
    response_model=list[ThreadMessage],
    summary="Get chat history",
    description="Return the authenticated patient's chat messages",
)
async def get_messages_route(
    user_info: USER_INFO_DEP,
):
    try:
        if user_info.role != Role.PATIENT:
            raise PermissionDenied("Only patients can access chat history")

        if not user_info.thread_id:
            raise InvalidRequest("User does not have an assigned thread")

        return await get_thread_messages(thread_id=user_info.thread_id)

    except PermissionDenied as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    except InvalidRequest as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
