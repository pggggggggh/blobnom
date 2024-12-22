import uuid
from datetime import datetime, timedelta

import pytz
from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.models.models import SolvedacToken, Member
from src.schemas.schemas import RegisterRequest


async def create_solvedac_token(db: Session):
    token_str = str(uuid.uuid4())
    token = SolvedacToken(
        token=token_str,
        expires_at=datetime.now(pytz.utc) + timedelta(minutes=10),
    )
    db.add(token)
    db.flush()
    db.commit()
    return token_str


async def register(register_request: RegisterRequest, db: Session):
    if db.query(Member).filter(Member.email == register_request.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
