import os
from datetime import timedelta, datetime
from typing import Optional

import jwt
import pytz
from fastapi import HTTPException
from fastapi.params import Depends, Header, Cookie
from jwt import InvalidTokenError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from starlette import status

from src.app.db.database import get_db
from src.app.db.models.models import User, Member
from src.app.utils.logger import logger

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


async def get_handle_by_token(access_token: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if access_token is None:
        return None  # 비회원
    # if not authorization.startswith("Bearer "):
    #     raise credentials_exception

    try:
        # token = authorization.split(" ")[1]
        payload = jwt.decode(access_token, os.environ.get("JWT_SECRET_KEY"),
                             algorithms=os.environ.get("JWT_ALGORITHM"))
        handle = payload.get("sub")
        logger.info(f"handle: {handle}")
        if handle is None:
            raise credentials_exception
        member = db.query(Member).filter(Member.handle == handle).first()
        if member is None:
            raise credentials_exception
        return member.handle
    except InvalidTokenError:
        raise credentials_exception
