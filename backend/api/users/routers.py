from fastapi import APIRouter, HTTPException, status

from api.core.db import SESSION_DEP
from api.security.service import USER_INFO_DEP
from api.users.service import (
    InvalidRequest,
    NotFound,
    PermissionDenied,
    accept_friend_request,
    get_all_friend_requests,
    send_friend_request,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/friend-request")
async def send_friend_request_route(
    patient_email: str,
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
):
    try:
        await send_friend_request(
            session=session,
            user_info=user_info,
            patient_email=patient_email,
        )
        return {"status": "friend request sent"}

    except PermissionDenied as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    except NotFound as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post("/friend-request/{therapist_id}/accept")
async def accept_friend_request_route(
    therapist_id: int,
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
):
    try:
        await accept_friend_request(
            session=session,
            user_info=user_info,
            therapist_id=therapist_id,
        )
        return {"status": "friend request accepted"}

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


@router.get("/friend-requests")
async def get_friend_requests_route(
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
    fr_status: str | None = None,
):
    try:
        return await get_all_friend_requests(
            session=session,
            user_info=user_info,
            status=fr_status,
        )

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
