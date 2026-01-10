from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from api.core.db import SESSION_DEP
from api.security.models import Token
from api.security.service import (
    authenticate_user,
    create_access_token,
    signup_user,
)
from api.users.models import UserIn

router = APIRouter(prefix="/auth")


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

    access_token = create_access_token(
        data={
            "email": user.email,
            "user_id": user.id,
            "role": user.role.value,
        }
    )

    response = {"access_token": access_token, "token_type": "bearer"}

    return response


@router.post("/signup", response_model=Token, status_code=201)
async def signup(session: SESSION_DEP, signup_data: UserIn):
    email = signup_data.email
    pwd = signup_data.password
    full_name = signup_data.full_name
    role = signup_data.role

    token = await signup_user(session, email, pwd, full_name, role)
    response = {"access_token": token, "token_type": "bearer"}

    return response
