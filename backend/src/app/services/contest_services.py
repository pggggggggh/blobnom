from datetime import datetime

import pytz
from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.app.core.enums import Role
from src.app.db.models.models import Member, Contest
from src.app.schemas.schemas import ContestCreateRequest


async def create_contest(contest_create_request: ContestCreateRequest, db: Session, token_handle: str):
    if token_handle is None:
        raise HTTPException(status_code=401)
    member = db.query(Member).filter(Member.handle == token_handle).first()
    if member.role is not Role.ADMIN:
        raise HTTPException(status_code=403)
    if contest_create_request.starts_at < datetime.now(tz=pytz.UTC):
        raise HTTPException(status_code=400)

    contest = Contest(
        name=contest_create_request.name,
        query=contest_create_request.query,
        type=contest_create_request.type,
        missions_per_room=contest_create_request.missions_per_room,
        players_per_room=contest_create_request.players_per_room,
        starts_at=contest_create_request.starts_at,
        ends_at=contest_create_request.ends_at,
    )
    db.add(contest)
    db.commit()

    return {"message": "success"}
