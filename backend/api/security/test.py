from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlmodel import Session, select

from api.cleaners.models import Cleaner
from api.core.crud import RoleInfo
from api.hosts.models import Host
from api.security.models import TokenData
from api.security.settings import settings
from api.users.models import User

"""
@Author: Ismael,
@date : 2025-11-13
"""


# TODO : exceptions class (file) for the different potential errors


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


def get_user(session: Session, email: str) -> User | None:
    """
    Return the user object linked to the user_id if it exist,
    Return None otherwise
    """
    query = select(User).where(User.email == email)
    user = session.exec(query).first()
    if not user:
        return None
    return user


def get_role(session: Session, user: User) -> Host | Cleaner | None:
    """
    Return the host or cleaner object depending on the user's role,
    Return None otherwise (unknown error)
    """
    match user.role:
        case "cleaner":
            model = Cleaner
        case "host":
            model = Host
        case _:
            raise HTTPException(500, "Unknown role")

    query = select(model).where(model.user_id == user.id)
    role_object = session.exec(query).first()
    if not role_object:
        return None
    return role_object


def authenticate_user(session: Session, email: str, password: str) -> User | None:
    """
    Verify email & password against db
    Return the user object if successful, None otherwise
    """
    user = get_user(session, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_role(session: Session, user: User) -> Host | Cleaner:
    if not user.id:
        raise Exception("DB not refreshed")

    if user.role == "host":
        role_object = Host(user_id=user.id, is_active=True)
    elif user.role == "cleaner":
        role_object = Cleaner(user_id=user.id, is_active=True)
    else:
        raise Exception("Invalid role when creating role at signup.")

    session.add(role_object)
    session.flush()

    return role_object


def signup_user(session: Session, email: str, password: str, role: str) -> str:
    """
    Signup method.
    Check for email uniqueness
    Create User object
    Create a role object (Host | Cleaner)
    Create a jwt token

    Return JWT token
    """
    # Check if email already used
    if get_user(session, email):
        raise HTTPException(status_code=409, detail="Email already registered.")

    if role not in {"cleaner", "host"}:
        raise HTTPException(400, "Invalid role.")

    hashed_pwd = get_password_hash(password)

    user = User(email=email, role=role, hashed_password=hashed_pwd)
    session.add(user)
    session.flush()

    role_obj = create_role(session, user)

    token = create_access_token(
        {
            "email": user.email,
            "user_id": user.id,
            "role": user.role,
            "role_id": role_obj.id,
        }
    )

    session.commit()

    return token


def create_access_token(data: dict, expires_minutes: int | None = None) -> str:
    """
    Return the encoded JWT token with TokenData + expiry as payload

    data should have the form:
        {
        "email": str
        "user_id": int,
        "role": str,
        "role_id": int
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
        role_id = payload.get("role_id")
        if user_id is None or role is None or role_id is None:
            raise Exception
        token_data = TokenData(email=email, user_id=user_id, role=role, role_id=role_id)

        return token_data

    except InvalidTokenError:
        raise Exception


def get_role_info(
    token_data: Annotated[TokenData, Depends(get_token_data)],
) -> RoleInfo:
    """
    Dependency to get RoleInfo object
    Calls get_token_data as a dep to do so
    """
    return RoleInfo.from_role(role=token_data.role, role_id=token_data.role_id)


# Role Info dependency, use for every (crud) request
ROLE_INFO_DEP = Annotated[RoleInfo, Depends(get_role_info)]
