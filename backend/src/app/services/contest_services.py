from datetime import datetime, timedelta

import pytz
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from src.app.core.constants import REGISTER_DEADLINE_SECONDS
from src.app.core.enums import Role
from src.app.db.models.models import Member, Contest, ContestMember
from src.app.schemas.schemas import ContestCreateRequest, ContestSummary, ContestDetails


def get_contest_summary(contest: Contest):
    return ContestSummary(
        id=contest.id,
        name=contest.name,
        query=contest.query,
        starts_at=contest.starts_at,
        ends_at=contest.ends_at,
        num_participants=len(contest.contest_members),
        players_per_room=contest.players_per_room,
        missions_per_room=contest.missions_per_room,
    )


async def get_contest_details(contest_id: int, db: Session, token_handle: str):
    contest = (
        db.query(Contest)
        .options(
            joinedload(Contest.contest_members).joinedload(ContestMember.member)
        )
        .filter(Contest.id == contest_id)
        .first()
    )
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")

    participants = []
    is_user_registered = False
    for contest_member in contest.contest_members:
        participants.append(contest_member.member.handle)
        if contest_member.member.handle == token_handle:
            is_user_registered = True

    return ContestDetails(
        id=contest.id,
        name=contest.name,
        query=contest.query,
        starts_at=contest.starts_at,
        ends_at=contest.ends_at,
        num_participants=len(participants),
        participants=participants,
        players_per_room=contest.players_per_room,
        missions_per_room=contest.missions_per_room,
        is_user_registered=is_user_registered,
    )


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


async def register_contest(contest_id: int, db: Session, token_handle: str):
    if token_handle is None:
        raise HTTPException(status_code=401)

    contest = db.query(Contest).filter(Contest.id == contest_id).first()
    if contest is None:
        raise HTTPException(status_code=404, detail="Contest not found")

    if datetime.now(tz=pytz.utc) > contest.starts_at - timedelta(seconds=REGISTER_DEADLINE_SECONDS):
        raise HTTPException(status_code=400, detail="Too late to register")

    member = db.query(Member).filter(Member.handle == token_handle).first()
    if (db.query(ContestMember).filter(ContestMember.contest_id == contest_id)
            .filter(ContestMember.member_id == member.id).first()):
        raise HTTPException(status_code=409, detail="Contest already registered")

    contest_member = ContestMember(
        contest_id=contest_id,
        member_id=member.id,
    )
    db.add(contest_member)
    db.commit()

    return {"message": "success"}


async def unregister_contest(contest_id: int, db: Session, token_handle: str):
    if token_handle is None:
        raise HTTPException(status_code=401)

    contest = db.query(Contest).filter(Contest.id == contest_id).first()
    if contest is None:
        raise HTTPException(status_code=404, detail="Contest not found")

    if datetime.now(tz=pytz.utc) > contest.starts_at - timedelta(seconds=REGISTER_DEADLINE_SECONDS):
        raise HTTPException(status_code=400, detail="Too late to unregister")

    member = db.query(Member).filter(Member.handle == token_handle).first()
    contest_member = (db.query(ContestMember).filter(ContestMember.contest_id == contest_id)
                      .filter(ContestMember.member_id == member.id).first())
    if contest_member is None:
        raise HTTPException(status_code=400, detail="You are not registered")
    db.delete(contest_member)
    db.commit()

    return {"message": "success"}
