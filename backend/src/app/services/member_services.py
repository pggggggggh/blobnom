import uuid
from datetime import datetime, timedelta

import pytz
from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from starlette.responses import JSONResponse

from src.app.core.enums import Platform
from src.app.db.models.models import SolvedacToken, Member, User, RoomMission, ContestMember
from src.app.schemas.schemas import RegisterRequest, LoginRequest, MemberSummary, MemberDetails, ContestHistory, \
    BindRequest
from src.app.utils.security_utils import hash_password, verify_password, create_access_token
from src.app.utils.platforms_utils import token_validate


async def convert_to_member_summary(member: Member, db: Session, with_accounts: bool = True) -> MemberSummary:
    accounts = {}
    if with_accounts:
        users = db.query(User).filter(User.member_id == member.id).all()
        for user in users:
            accounts[user.platform] = user.handle
    return MemberSummary(
        handle=member.handle,
        rating=member.rating,
        role=member.role,
        accounts=accounts
    )


async def convert_to_user_summary(user: User, db: Session) -> MemberSummary:
    # 아직 비회원 정보가 user에 남아있기에 사용하는 레거시 함수, 삭제 예정
    handle = user.handle
    member = user.member
    if member is not None:
        return await convert_to_member_summary(member, db)
    return MemberSummary(
        handle=handle,
        rating=None,
        role=None,
        accounts={Platform.BOJ: handle}
    )


async def get_member_details(handle: str, db: Session) -> MemberDetails:
    member = db.query(Member).filter(Member.handle == handle).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    num_solved_missions = 0
    for user in member.users:
        num_solved_missions += user.num_solved_missions

    contest_history_list = []
    contest_members = db.query(ContestMember).filter(ContestMember.member_id == member.id).options(
        joinedload(ContestMember.contest)
    ).order_by(ContestMember.id).all()
    for contest_member in contest_members:
        if contest_member.final_rank is None:
            continue
        # if contest_member.contest.is_rated is False:
        #     continue
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

    user_summary = await convert_to_user_summary(user, db)
    return MemberDetails(
        handle=handle,
        desc="",
        rating=member.rating,
        num_solved_missions=num_solved_missions,
        contest_history=contest_history_list,
        user_summary=user_summary,
    )


async def create_token(db: Session):
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
    await token_validate(register_request.handle, register_request.platform, db)

    member = Member(
        handle=register_request.handle.lower(),
        email=register_request.email.lower(),
        password=hash_password(register_request.password),
    )
    db.add(member)
    db.flush()

    user = db.query(User).filter(User.handle == member.handle, User.platform == register_request.platform).first()
    if not user:
        user = User(
            handle=member.handle,
            platform=register_request.platform,
        )
    elif user.member_id is not None:
        raise HTTPException(
            status_code=409,
            detail="Handle or email already taken"
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
    response = JSONResponse(content={"status": "success"})
    response.set_cookie("access_token", create_access_token(data={"sub": member.handle}, expires_delta=td),
                        httponly=True, secure=True, samesite="none", max_age=int(td.total_seconds()))
    return response


async def logout():
    response = JSONResponse(content={"status": "success"})
    response.delete_cookie("access_token")
    return response


async def bind_account(bind_request: BindRequest, member_handle: str, db: Session):
    await token_validate(bind_request.handle, bind_request.platform, db)

    member = db.query(Member).filter(Member.handle == member_handle).first()
    existing_user = db.query(User).filter(User.handle == bind_request.handle,
                                          User.platform == bind_request.platform).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="이미 연동된 핸들입니다.")

    user = db.query(User).filter(User.member_id == member.id, User.platform == bind_request.platform).first()
    if user:
        user.handle = bind_request.handle.lower()
    else:
        user = User(
            handle=bind_request.handle.lower(),
            member_id=member.id,
            platform=bind_request.platform,
        )
    db.add(user)
    db.commit()
