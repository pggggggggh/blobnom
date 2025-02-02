import math
import os
import random
from datetime import datetime, timedelta

import pytz
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from src.app.core.constants import REGISTER_DEADLINE_SECONDS
from src.app.core.enums import Role, ContestType, ModeType
from src.app.db.models.models import Member, Contest, ContestMember, Room, ContestRoom, User, RoomPlayer
from src.app.db.session import SessionLocal
from src.app.schemas.schemas import ContestCreateRequest, ContestSummary, ContestDetails
from src.app.services.room_services import handle_room_start, handle_room_ready, get_room_detail
from src.app.utils.contest_utils import elo_update
from src.app.utils.logger import logger
from src.app.utils.scheduler import add_job


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
        .options(
            joinedload(Contest.contest_rooms).joinedload(ContestRoom.room).joinedload(Room.players)
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

    room_details = {}
    user_room_id = None
    if contest.is_started:
        for contest_room in contest.contest_rooms:
            room_info = await get_room_detail(contest_room.id, db, token_handle, without_mission_info=True)
            room_details[contest_room.index] = room_info
            if room_info.is_user_in_room:
                user_room_id = room_info.id

    return ContestDetails(
        id=contest.id,
        name=contest.name,
        query=contest.query,
        starts_at=contest.starts_at,
        ends_at=contest.ends_at,
        num_participants=len(participants),
        participants=participants[:20],
        players_per_room=contest.players_per_room,
        missions_per_room=contest.missions_per_room,
        is_user_registered=is_user_registered,
        is_started=contest.is_started,
        user_room_id=user_room_id,
        room_details=room_details
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
        is_started=False
    )
    db.add(contest)
    db.commit()

    print(contest.starts_at)

    add_job(
        handle_contest_ready,
        run_date=contest.starts_at - timedelta(seconds=REGISTER_DEADLINE_SECONDS),
        args=[contest.id],
    )
    print(contest.starts_at - timedelta(seconds=REGISTER_DEADLINE_SECONDS))

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

        if len(contest.contest_rooms):  # already set, just start
            add_job(
                handle_contest_start,
                run_date=contest.starts_at,
                args=[contest.id],
            )
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
        print("@")

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
                entry_pwd=os.environ.get("DEFAULT_PWD"),
                edit_pwd=os.environ.get("DEFAULT_PWD"),
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

        add_job(handle_contest_end, run_date=contest.ends_at, args=[contest_id])

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
            room_info = await get_room_detail(contest_room.id, db, None, without_mission_info=True)
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

            new_rating = [member.rating for member in members]
            if contest.is_rated:
                for i, player_a in enumerate(members):
                    orig_rating = player_a.rating
                    for j, player_b in enumerate(members):
                        if i == j:
                            continue
                        result = 0
                        if ranks[i] < ranks[j]:
                            result = 1
                        elif ranks[i] > ranks[j]:
                            result = 0
                        else:
                            result = 0.5
                        a_new_rating, b_new_rating = elo_update(orig_rating, player_b.rating, result)

                        new_rating[i] += a_new_rating - orig_rating

                for i, member in enumerate(members):
                    contest_members[i].rating_before = member.rating
                    contest_members[i].rating_after = new_rating[i]
                    member.rating = new_rating[i]
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
