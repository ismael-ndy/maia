from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from api.chats.models import SendMessageRequest
from api.chats.service import stream_message
from api.security.service import USER_INFO_DEP
from api.users.service import InvalidRequest, PermissionDenied

router = APIRouter(prefix="/chats")


@router.post("/messages/stream")
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
                yield f"data: {event}\n\n"

        except PermissionDenied as e:
            yield (f'data: {{"type": "error", "message": "{str(e)}"}}\n\n')

        except InvalidRequest as e:
            yield (f'data: {{"type": "error", "message": "{str(e)}"}}\n\n')

        except Exception as _:
            yield ('data: {{"type": "error", "message": "Internal server error"}}\n\n')

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )
