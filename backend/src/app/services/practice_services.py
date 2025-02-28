import os
from datetime import timedelta, datetime

import pytz
from fastapi import HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session
from typing_extensions import Optional

from src.app.core.enums import ModeType, BoardType, PenaltyType
from src.app.db.models.models import PracticeSet, User, Member, Room, RoomPlayer, PracticeMember, RoomMission
from src.app.schemas.schemas import PracticeSummary, PracticeStartRequest
from src.app.services.room_services import handle_room_ready
from src.app.utils.platforms_utils import get_solved_problem_list
from src.app.utils.security_utils import hash_password


async def get_practice_list(db: Session, token_handle: Optional[str]):
    practices = db.query(PracticeSet).order_by(
        desc(PracticeSet.created_at))

    practice_list = []
    for practice in practices:
        contest_data = await get_practice_summary(practice, db, token_handle)
        practice_list.append(contest_data)

    return practice_list


async def check_is_eligible(practice_id: int, db: Session, token_handle: str):
    if token_handle is None:
        raise HTTPException(status_code=401)
    practice = db.query(PracticeSet).filter(PracticeSet.id == practice_id).first()
    member = db.query(Member).filter(Member.handle == token_handle).first()
    if db.query(PracticeMember).filter(PracticeMember.practice_set_id == practice.id,
                                       PracticeMember.member_id == member.id).first():
        raise HTTPException(status_code=400, detail="이미 연습이 존재합니다.")
    handle = db.query(User).filter(User.member_id == member.id, User.platform == practice.platform).first()
    if handle is None:
        raise HTTPException(status_code=400, detail="이 플랫폼과 연동해주세요.")
    solved_problems = await get_solved_problem_list(practice.problem_ids, token_handle, practice.platform)
    if len(solved_problems) > 0:
        raise HTTPException(status_code=400, detail="풀려있는 문제가 있어 참가할 수 없습니다.")
    return {"status": "success", "id": practice_id}


async def get_practice_summary(practice: PracticeSet, db: Session,
                               token_handle: Optional[str] = None) -> PracticeSummary:
    your_room_id = None
    if token_handle is not None:
        member = db.query(Member).filter(Member.handle == token_handle).first()
        practice_member = db.query(PracticeMember).filter(PracticeMember.practice_set_id == practice.id,
                                                          PracticeMember.member_id == member.id).first()
        if practice_member is not None:
            your_room_id = practice_member.room_id

    return PracticeSummary(
        id=practice.id,
        name=practice.name,
        platform=practice.platform,
        difficulty=practice.difficulty,
        num_missions=len(practice.problem_ids),
        duration=practice.duration,
        your_room_id=your_room_id
    )


async def start_practice(practice_id: int, practice_start_request: PracticeStartRequest, db: Session,
                         token_handle: Optional[str] = None):
    practice = db.query(PracticeSet).filter(PracticeSet.id == practice_id).first()
    if practice is None:
        raise HTTPException(status_code=404, detail="Practice not found")
    if token_handle is None:
        raise HTTPException(status_code=401)
    member = db.query(Member).filter(Member.handle == token_handle).first()
    user = db.query(User).filter(User.member_id == member.id, User.platform == practice.platform).first()
    if user is None:
        raise HTTPException(status_code=400, detail="해당 플랫폼 연동해주시기 바랍니다.")

    if db.query(PracticeMember).filter(PracticeMember.practice_set_id == practice.id,
                                       PracticeMember.member_id == member.id).first():
        raise HTTPException(status_code=400, detail="이미 연습이 존재합니다.")

    # temporarily set to any admin
    owner = db.query(Member).filter(Member.handle == "pgggggggggh").first()
    query = "problemset:" + ",".join(map(str, practice.problem_ids))
    print(query)

    room = Room(
        name=f"{practice.name} : {token_handle}",
        query=query,
        owner=owner,
        num_mission=len(practice.problem_ids),
        entry_pwd=hash_password(os.environ.get("DEFAULT_PWD")),
        edit_pwd=hash_password(os.environ.get("DEFAULT_PWD")),
        mode_type=ModeType.PRACTICE_LINEAR,
        board_type=BoardType.LINEAR,
        max_players=1,
        platform=practice.platform,
        is_started=False,
        starts_at=practice_start_request.start_time,
        ends_at=practice_start_request.start_time + timedelta(minutes=practice.duration),
        is_private=True,
        last_solved_at=datetime.now(tz=pytz.UTC),
        unfreeze_offset_minutes=0,
        is_contest_room=True
    )
    db.add(room)
    db.flush()

    room_player = RoomPlayer(
        user_id=user.id,
        room_id=room.id,
        player_index=0,
        team_index=0,
        last_solved_at=room.starts_at
    )
    db.add(room_player)
    db.flush()

    practice_member = PracticeMember(
        practice_set_id=practice.id,
        room_id=room.id,
        member_id=member.id
    )
    db.add(practice_member)
    db.flush()

    db.commit()

    await handle_room_ready(room.id)

    return {"status": "success", "roomId": room.id}


async def get_current_rank(practice: PracticeSet, member: Member, db: Session):
    realtime = True
    practice_session = None

    if member is None:
        realtime = False
    else:
        practice_session = db.query(PracticeMember).filter(PracticeMember.member_id == member.id,
                                                           PracticeMember.practice_set_id == practice.id).first()
    if practice_session is None:
        realtime = False
    else:
        my_room = practice_session.room
        if datetime.now(tz=pytz.UTC) > my_room.ends_at:
            realtime = False
        else:
            my_running_time = datetime.now(tz=pytz.UTC) - my_room.starts_at

    sessions = db.query(PracticeMember).filter(PracticeMember.practice_set_id == practice.id).all()
    rank = []
    your_rank = None

    for session in sessions:
        room = session.room
        if not room.is_started:
            continue
        if not realtime:
            until = room.ends_at
        else:
            until = room.starts_at + my_running_time
        solved_missions = (db.query(RoomMission).filter(RoomMission.room_id == room.id,
                                                        RoomMission.solved_at.isnot(None),
                                                        RoomMission.solved_at <= until).all())
        penalty = 0
        score = len(solved_missions)
        solve_time_list = [None for _ in range(room.num_mission)]
        for mission in solved_missions:
            solved_sec = int((mission.solved_at - room.starts_at).total_seconds())
            solve_time_list[mission.index_in_room] = solved_sec
            if practice.penalty_type == PenaltyType.ICPC:
                penalty += solved_sec // 60

        if practice_session and session.id == practice_session.id:
            your_rank = len(rank) + 1

        running_time = None
        if datetime.now(pytz.UTC) < room.ends_at:
            running_time = int((datetime.now(tz=pytz.UTC) - room.starts_at).total_seconds())

        rank.append({
            "running_time": running_time,
            "score": score,
            "solve_time_list": solve_time_list,
            "penalty": penalty,
        })
    rank.sort(key=lambda x: (x["score"], -x["penalty"]), reverse=True)
    return {"practice_name": practice.name, "time": int(my_running_time.total_seconds()) if realtime else None,
            "rank": rank, "your_rank": your_rank}
