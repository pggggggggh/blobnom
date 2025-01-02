import os
from datetime import timedelta, datetime

import jwt
import pytz
from fastapi import HTTPException
from jwt import InvalidTokenError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from starlette import status

from src.models.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(pytz.utc) + expires_delta
    else:
        expire = datetime.now(pytz.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.environ.get("JWT_SECRET_KEY"), algorithm=os.environ.get("JWT_ALGORITHM"))
    return encoded_jwt


async def get_handle_by_token(token: str, db: Session):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, os.environ.get("JWT_SECRET_KEY"), algorithms=os.environ.get("JWT_ALGORITHM"))
        handle = payload.get("sub")
        if handle is None:
            raise credentials_exception
        user = db.query(User).filter(User.handle == handle).first()
        if user is None or user.member is None:  # 가입 안 한 상태
            raise credentials_exception
        return user.handle
    except InvalidTokenError:
        raise credentials_exception
