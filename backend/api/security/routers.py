from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

from api.core.db import SESSION_DEP
from api.security.models import Token
from api.security.service import (
    USER_INFO_DEP,
    authenticate_user,
    create_access_token,
    signup_user,
)
from api.users.models import User, UserIn, UserOut

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: SESSION_DEP
):
    """
    Enpoint for authentification
    Checks username (email) and password against the database

    Returns JWT token (frontend must store it in the headers)
    """
    user = await authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    thread_id = None
    if user.patient:
        thread_id = user.patient.thread_id

    access_token = create_access_token(
        data={
            "email": user.email,
            "user_id": user.id,
            "role": user.role.value,
            "thread_id": thread_id,
        }
    )

    response = {"access_token": access_token, "token_type": "bearer"}

    return response


@router.post("/signup", response_model=Token, status_code=201)
async def signup(session: SESSION_DEP, signup_data: UserIn):
    token = await signup_user(session, signup_data)
    response = {"access_token": token, "token_type": "bearer"}

    return response


@router.get("/me", response_model=UserOut)
async def get_current_user_info(
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
):
    """
    Get the current user's profile information.
    """
    stmt = select(User).where(User.id == user_info.user_id)
    result = await session.execute(stmt)
    user = result.scalars().one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserOut(
        id=user.id,
        email=user.email,
        role=user.role.value,
        full_name=user.full_name,
        phone_number=user.phone_number,
    )
