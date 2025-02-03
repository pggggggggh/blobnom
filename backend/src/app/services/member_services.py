import uuid
from datetime import datetime, timedelta

import pytz
from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from src.app.db.models.models import SolvedacToken, Member, User, RoomMission, ContestMember
from src.app.schemas.schemas import RegisterRequest, LoginRequest, UserSummary, MemberDetails, ContestHistory
from src.app.utils.security_utils import hash_password, verify_password, create_access_token
from src.app.utils.solvedac_utils import fetch_user_info


async def convert_to_user_summary(user: User, db: Session) -> UserSummary:
    member = db.query(Member).filter(Member.handle == user.handle).first()
    role = None
    rating = None
    if member is not None:
        role = member.role
        rating = member.rating
    return UserSummary(
        handle=user.handle,
        rating=rating,
        role=role,
    )


async def get_member_details(handle: str, db: Session) -> MemberDetails:
    member = db.query(Member).filter(Member.handle == handle).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    user = db.query(User).filter(User.handle == handle).first()
    num_solved_missions = db.query(RoomMission).filter(RoomMission.solved_user_id == user.id).count()

    contest_history_list = []
    contest_members = db.query(ContestMember).filter(ContestMember.member_id == member.id).options(
        joinedload(ContestMember.contest)
    ).order_by(ContestMember.id).all()
    for contest_member in contest_members:
        if contest_member.final_rank is None:
            continue
        contest_history = ContestHistory(
            rating_before=contest_member.rating_before,
            rating_after=contest_member.rating_after,
            contest_id=contest_member.contest_id,
            contest_name=contest_member.contest.name,
            final_rank=contest_member.final_rank,
            is_rated=contest_member.contest.is_rated,
            started_at=contest_member.contest.starts_at,
            performance=contest_member.performance,
        )
        contest_history_list.append(contest_history)

    return MemberDetails(
        handle=handle,
        desc="",
        rating=member.rating,
        num_solved_missions=num_solved_missions,
        contest_history=contest_history_list
    )


async def create_solvedac_token(db: Session):
    token_str = str(uuid.uuid4())
    token = SolvedacToken(
        token=token_str,
        expires_at=datetime.now(pytz.utc) + timedelta(minutes=10),
    )
    db.add(token)
    db.flush()
    db.commit()
    return {
        "token": token_str,
        "expires_at": token.expires_at.isoformat()
    }


async def register(register_request: RegisterRequest, db: Session):
    if db.query(Member).filter(
            or_(Member.email == register_request.email, Member.handle == register_request.handle)
    ).first():
        raise HTTPException(
            status_code=409,
            detail="Handle or email already taken"
        )
    user_info = await fetch_user_info(register_request.handle)
    if user_info is None:
        raise HTTPException(status_code=404, detail="User not found")
    bio = user_info["bio"]
    solvedac_token = db.query(SolvedacToken).filter(SolvedacToken.token == bio).first()
    if solvedac_token is None or solvedac_token.expires_at < datetime.now(pytz.utc) or solvedac_token.is_used:
        raise HTTPException(status_code=400, detail="Token validation failed")

    member = Member(
        handle=register_request.handle.lower(),
        email=register_request.email.lower(),
        password=hash_password(register_request.password),
    )
    solvedac_token.is_used = True
    db.add(member)
    db.add(solvedac_token)
    db.flush()

    user = db.query(User).filter(User.handle == member.handle).first()
    if not user:
        user = User(
            handle=member.handle,
        )
    user.member = member
    db.add(user)
    db.flush()

    db.commit()
    return {"result": "success"}


async def login(login_request: LoginRequest, db: Session):
    member = db.query(Member).filter(Member.handle == login_request.handle).first()
    if member is None:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(login_request.password, member.password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    td = timedelta(days=30)
    # if login_request.remember_me:
    #     td = timedelta(days=30)
    return create_access_token(data={"sub": member.handle}, expires_delta=td)
