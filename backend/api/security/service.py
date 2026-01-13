from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.chats.service import create_patient
from api.security.models import TokenData
from api.security.settings import settings
from api.users.models import Role, User, UserIn

password_hash = PasswordHash.recommended()  # hash utility (argon2 hasher)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")  # token dependency


def verify_password(input_pwd: str, hashed_pwd: str) -> bool:
    """
    Returns true if input password and hashed password match
    """
    return password_hash.verify(input_pwd, hashed_pwd)


def get_password_hash(input_pwd: str) -> str:
    """
    Hash the input password
    """
    return password_hash.hash(input_pwd)


async def get_user(session: AsyncSession, email: str) -> User | None:
    """
    Return the user object linked to the email arg if it exist,
    Return None otherwise
    """
    statement = (
        select(User).where(User.email == email).options(selectinload(User.patient))
    )
    result = await session.execute(statement)
    user = result.scalar_one_or_none()
    if not user:
        return None
    return user


async def authenticate_user(
    session: AsyncSession, email: str, password: str
) -> User | None:
    """
    Verify email & password against db
    Return the user object if successful, None otherwise
    """
    user = await get_user(session, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_pw):
        return None
    return user


async def signup_user(session: AsyncSession, signup_data: UserIn) -> str:
    """
    Signup method.
    Check for email uniqueness
    Create User object
    Create a jwt token

    Return JWT token
    """
    # Check if email already used
    if await get_user(session, signup_data.email):
        raise HTTPException(status_code=409, detail="Email already registered.")

    try:
        role = Role(signup_data.role)
    except ValueError:
        raise HTTPException(400, "Invalid role.")

    hashed_pwd = get_password_hash(signup_data.password)

    user = User(
        email=signup_data.email,
        role=role,
        full_name=signup_data.full_name,
        phone_number=signup_data.phone_number,
        hashed_pw=hashed_pwd,
    )

    try:
        session.add(user)
        await session.commit()
        await session.refresh(user)
    except:
        await session.rollback()
        raise

    thread_id = await create_patient(session, user.id)
    print(thread_id)

    token = create_access_token(
        {
            "email": user.email,
            "user_id": user.id,
            "role": user.role.value,
            "thread_id": str(thread_id),
        }
    )

    return token


def create_access_token(data: dict, expires_minutes: int | None = None) -> str:
    """
    Return the encoded JWT token with TokenData + expiry as payload

    data should have the form:
        {
        "email": str
        "user_id": int,
        "role": str,
        "thread_id": str
        }
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def get_token_data(token: Annotated[str, Depends(oauth2_scheme)]) -> TokenData:
    """
    Dependency to get user object based on JWT token
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email = payload.get("email")
        user_id = payload.get("user_id")
        role = payload.get("role")
        thread_id = payload.get("thread_id")
        if user_id is None or role is None:
            raise Exception
        token_data = TokenData(
            email=email,
            user_id=int(user_id),
            role=Role(role),
            thread_id=thread_id,
        )

        return token_data

    except InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# User Info dependency, use for every user request
USER_INFO_DEP = Annotated[TokenData, Depends(get_token_data)]
