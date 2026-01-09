from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlmodel import Session, select

from api.users.models import User

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
