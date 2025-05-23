import math
import os
import pickle
import random
from datetime import datetime, timedelta

import pytz
from fastapi import HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from src.app.core.constants import REGISTER_DEADLINE_SECONDS, CONTEST_CACHE_SECONDS
from src.app.core.enums import Role, ContestType, ModeType, Platform
from src.app.db.models.models import Member, Contest, ContestMember, Room, ContestRoom, User, RoomPlayer
from src.app.db.redis import get_redis
from src.app.db.session import SessionLocal
from src.app.schemas.schemas import ContestCreateRequest, ContestSummary, ContestDetails
from src.app.services.member_services import convert_to_user_summary, convert_to_member_summary
from src.app.services.room_services import handle_room_start, handle_room_ready, get_room_detail
from src.app.utils.contest_utils import elo_update, codeforces_update, get_contest_summary
from src.app.utils.logger import logger
from src.app.utils.scheduler import add_job

import asyncio

from src.app.utils.security_utils import hash_password


async def get_contest_details(contest_id: int, db: Session, token_handle: str):
    redis = await get_redis()
    if redis:
        cache_key = f"contest:details:{contest_id}"
        cached_data = await redis.get(cache_key)
        if cached_data:
            return pickle.loads(cached_data)

    contest = (
        db.query(Contest)
        .filter(Contest.id == contest_id)
        .options(
            joinedload(Contest.contest_members).joinedload(ContestMember.member)
        )
        .options(
            joinedload(Contest.contest_rooms).joinedload(ContestRoom.room).joinedload(Room.players)
        )
        .first()
    )
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")

    participant_futures = [convert_to_member_summary(cm.member, db) for cm in contest.contest_members]
    participants = await asyncio.gather(*participant_futures)

    if token_handle:
        member = db.query(Member).filter(Member.handle == token_handle).first()
        is_user_registered = member in contest.contest_members
    else:
        is_user_registered = False

    room_details = {}
    user_room_id = None
    if contest.is_started:
        # 방 정보 조회 병렬 실행
        room_futures = [
            get_room_detail(contest_room.room_id, db, token_handle, without_mission_info=True)
            for contest_room in contest.contest_rooms
        ]
        room_infos = await asyncio.gather(*room_futures)

        for contest_room, room_info in zip(contest.contest_rooms, room_infos):
            room_details[contest_room.index] = room_info
            if room_info.is_user_in_room:
                user_room_id = room_info.id

    contest_details = ContestDetails(
        id=contest.id,
        name=contest.name,
        desc=contest.desc,
        query=contest.query,
        starts_at=contest.starts_at,
        ends_at=contest.ends_at,
        num_participants=len(participants),
        participants=participants,
        players_per_room=contest.players_per_room,
        missions_per_room=contest.missions_per_room,
        is_user_registered=is_user_registered,
        is_started=contest.is_started,
        is_ended=contest.is_ended,
        user_room_id=user_room_id,
        room_details=room_details,
        is_rated=contest.is_rated,
        min_rating=contest.min_rating,
        max_rating=contest.max_rating,
    )

    if redis:
        await redis.setex(cache_key, CONTEST_CACHE_SECONDS, pickle.dumps(contest_details))

    return contest_details


async def get_contest_list(myContestOnly: bool, db: Session, token_handle: str):
    contests = db.query(Contest).order_by(
        desc(Contest.starts_at))

    contest_list = []
    for contest in contests:
        contest_data = get_contest_summary(contest)
        contest_list.append(contest_data)

    return contest_list


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
        desc=contest_create_request.desc,
        query=contest_create_request.query,
        type=contest_create_request.type,
        missions_per_room=contest_create_request.missions_per_room,
        players_per_room=contest_create_request.players_per_room,
        starts_at=contest_create_request.starts_at,
        ends_at=contest_create_request.ends_at,
        is_rated=contest_create_request.is_rated,
        min_rating=contest_create_request.min_rating,
        max_rating=contest_create_request.max_rating,
        is_started=False
    )
    db.add(contest)
    db.commit()

    add_job(
        handle_contest_ready,
        run_date=contest.starts_at - timedelta(seconds=REGISTER_DEADLINE_SECONDS),
        args=[contest.id],
        job_id=f"contest_ready_{contest.id}",
    )

    return {"message": "success"}


async def handle_contest_ready(contest_id: int):
    logger.info(f"Setting contest {contest_id}")
    db: Session = SessionLocal()
    try:
        contest = db.query(Contest).filter(Contest.id == contest_id).first()
        if not contest:
            return
        if contest.is_deleted or contest.is_started:
            return

        members = db.query(ContestMember).filter(ContestMember.contest_id == contest_id).all()
        member_handles = [member.member.handle for member in members]
        random.shuffle(member_handles)

        num_total_players = len(members)
        if num_total_players == 0:
            contest.is_deleted = True
            db.add(contest)
            db.commit()
            return

        players_per_room = contest.players_per_room

        num_rooms = math.ceil(num_total_players / players_per_room)
        initial_num_players_per_room = num_total_players // num_rooms
        num_players_list = [initial_num_players_per_room for _ in range(num_rooms)]
        remainder = num_total_players - (num_rooms * initial_num_players_per_room)
        for i in range(remainder):
            num_players_list[i] += 1

        # temporarily set to any admin
        owner = db.query(User).filter(User.handle == "pgggggggggh").first()

        room_mode_type = None
        unfreeze_offset_minutes = None

        if contest.type == ContestType.CONTEST_BOJ_GENERAL:
            room_mode_type = ModeType.LAND_GRAB_SOLO
            unfreeze_offset_minutes = 0
        else:
            return

        start_idx = 0
        rooms = []
        for i, num_players in enumerate(num_players_list):
            room = Room(
                name=f"{contest.name} Room #{i + 1}",
                query=contest.query,
                owner=owner,
                num_mission=contest.missions_per_room,
                entry_pwd=hash_password(os.environ.get("DEFAULT_PWD")),
                platform=Platform.BOJ,
                edit_pwd=hash_password(os.environ.get("DEFAULT_PWD")),
                mode_type=room_mode_type,
                max_players=contest.players_per_room,
                is_started=False,
                starts_at=contest.starts_at,
                ends_at=contest.ends_at,
                is_private=True,
                last_solved_at=datetime.now(tz=pytz.UTC),
                unfreeze_offset_minutes=unfreeze_offset_minutes,
                is_contest_room=True
            )
            rooms.append(room)
            db.add(room)
            db.flush()
            contest_room = ContestRoom(
                contest_id=contest.id,
                room_id=room.id,
                index=i
            )
            db.add(contest_room)
            db.flush()

            player_idx = 0
            for j in range(start_idx, start_idx + num_players):
                user = db.query(User).filter(User.handle == member_handles[j]).first()
                room_player = RoomPlayer(
                    user_id=user.id,
                    room_id=room.id,
                    player_index=player_idx,
                    team_index=player_idx,
                    last_solved_at=room.starts_at
                )
                db.add(room_player)
                db.flush()
                player_idx += 1

            start_idx += num_players

        db.commit()

        add_job(
            handle_contest_start,
            run_date=contest.starts_at,
            args=[contest.id],
            job_id=f"contest_start_{contest.id}",
        )

        for room in rooms:
            await handle_room_ready(room.id)

        logger.info(f"Contest {contest_id} has set successfully. Will start at {contest.starts_at}")

    except Exception as e:
        logger.info(f"Error setting contest {contest_id}: {e}")


async def handle_contest_start(contest_id: int):
    db: Session = SessionLocal()
    try:
        contest = db.query(Contest).filter(Contest.id == contest_id).first()
        if not contest:
            raise HTTPException(status_code=404, detail="Contest not found")
        contest_rooms = db.query(ContestRoom).filter(ContestRoom.contest_id == contest_id).all()
        for contest_room in contest_rooms:
            room = contest_room.room
            await handle_room_start(room.id, db)

        contest.is_started = True
        db.add(contest)
        db.commit()

        add_job(handle_contest_end, run_date=contest.ends_at, args=[contest_id], job_id=f"contest_end_{contest_id}")

        logger.info(f"Contest {contest_id} has started successfully.")
    except Exception as e:
        logger.error(f"Contest {contest_id}: {e}")
    finally:
        db.close()


async def handle_contest_end(contest_id: int):
    db: Session = SessionLocal()
    try:
        contest = db.query(Contest).filter(Contest.id == contest_id).first()
        if not contest:
            raise HTTPException(status_code=404, detail="Contest not found")
        if contest.is_ended or not contest.is_started:
            raise HTTPException(status_code=400)

        contest_rooms = db.query(ContestRoom).filter(ContestRoom.contest_id == contest_id).all()
        for contest_room in contest_rooms:
            room_info = await get_room_detail(contest_room.room_id, db, None, without_mission_info=True)
            team_info = room_info.team_info
            members = []
            contest_members = []
            ranks = []
            for i, team in enumerate(team_info):
                handle = team.users[0]["user"].handle
                member = db.query(Member).filter(Member.handle == handle).first()
                contest_member = db.query(ContestMember).filter(ContestMember.contest_id == contest_id,
                                                                ContestMember.member_id == member.id).first()
                if team.total_solved_count == 0:
                    rank = len(team_info)
                else:
                    rank = i + 1
                ranks.append(rank)
                members.append(member)
                contest_members.append(contest_member)
                contest_member.final_rank = rank
                db.add(contest_member)

            ratings = [member.rating for member in members]
            res = codeforces_update(ratings, ranks)
            new_ratings = res["ratings"]
            performances = res["performance"]

            for i, member in enumerate(members):
                if contest.is_rated:
                    contest_members[i].rating_before = member.rating
                    contest_members[i].rating_after = new_ratings[i]
                    contest_members[i].performance = performances[i]
                    member.rating = new_ratings[i]
                else:
                    contest_members[i].rating_before = member.rating
                    contest_members[i].rating_after = member.rating
                    contest_members[i].performance = performances[i]
                db.add(member)
                db.add(contest_members[i])

            db.flush()
        contest.is_ended = True
        db.commit()
    except Exception as e:
        logger.error(f"Error finishing contest {contest_id}: {e}")
        print(f"Error finishing contest {contest_id}: {e}")
    finally:
        db.close()


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

    if contest.min_rating is not None and member.rating < contest.min_rating:
        raise HTTPException(status_code=400, detail="레이팅 범위에 맞지 않습니다.")
    if contest.max_rating is not None and member.rating > contest.max_rating:
        raise HTTPException(status_code=400, detail="레이팅 범위에 맞지 않습니다.")

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
