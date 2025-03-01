import pickle
from datetime import datetime

import pytz
from sqlalchemy.orm import Session, joinedload

from src.app.core.constants import STATS_CACHE_SECONDS, ACTIVE_USERS_CACHE_SECONDS
from src.app.core.enums import ModeType
from src.app.core.socket import sio
from src.app.db.models.models import RoomMission, Member, Room
from src.app.db.redis import get_redis
from src.app.schemas.schemas import SiteStats, LeaderboardEntry, Leaderboards, ActiveUsersData
from src.app.services.member_services import convert_to_member_summary


async def get_stats(db: Session):
    redis = await get_redis()
    cache_key = f"stats"

    num_active_users = -1
    if redis:
        cached_data = await redis.get(cache_key)
        num_active_users = await redis.hlen("sid_to_handle")
        if cached_data:
            return pickle.loads(cached_data)

    num_solved_missions = db.query(RoomMission).filter(RoomMission.solved_at.isnot(None)).count()
    num_members = db.query(Member).count()
    updated_at = datetime.now(pytz.UTC)

    site_stats = SiteStats(
        num_solved_missions=num_solved_missions,
        num_members=num_members,
        num_active_users=num_active_users,
        updated_at=updated_at
    )

    if redis:
        await redis.setex(cache_key, STATS_CACHE_SECONDS, pickle.dumps(site_stats))
    return site_stats


async def get_leaderboards(limit: int, offset: int, db: Session):
    redis = await get_redis()
    cache_key = f"leaderboards"

    if redis:
        cached_data = await redis.get(cache_key)
        if cached_data:
            return pickle.loads(cached_data)
    else:
        return  # 리더보드는 로드가 커서 Redis 꺼져있으면 그냥 표시 안 하기

    members = db.query(Member).options(joinedload(Member.users)).all()
    member_list = []
    for member in members:
        num_solved_missions = 0
        for user in member.users:
            num_solved_missions += user.num_solved_missions
        member_list.append([member, num_solved_missions * 10, num_solved_missions])
    member_list.sort(key=lambda x: x[1], reverse=True)

    sliced_member_list = member_list[offset:offset + limit]
    updated_at = datetime.now(pytz.UTC)

    leaderboards = []
    for member, points, num_solved_missions in sliced_member_list:
        leaderboards.append(
            LeaderboardEntry(
                member_summary=await convert_to_member_summary(member, db, with_accounts=False),
                points=points,
                num_solved_missions=num_solved_missions,
            )
        )

    leaderboards_data = Leaderboards(updated_at=updated_at, leaderboards=leaderboards)

    if redis:
        await redis.set(cache_key, pickle.dumps(leaderboards_data))

    return leaderboards_data


async def get_active_users(db: Session):
    redis = await get_redis()
    cache_key = f"active_users"
    if redis:
        cached_data = await redis.get(cache_key)
        if cached_data:
            return pickle.loads(cached_data)
    else:
        return

    sessions_with_rooms = {}
    rooms = sio.manager.rooms.get("/", {})
    for room, bidict_obj in rooms.items():
        if room and room.startswith("room_"):
            room_id = room[len("room_"):]
            room = db.query(Room).filter(Room.id == room_id).first()
            secret = False
            if room.mode_type == ModeType.PRACTICE_LINEAR:
                secret = True
            for session_id in bidict_obj.keys():
                handle = await redis.hget("sid_to_handle", session_id)
                if handle:
                    if handle not in sessions_with_rooms:
                        sessions_with_rooms[handle] = room_id if not secret else 0

    for session_id in rooms[None].keys():
        handle = await redis.hget("sid_to_handle", session_id)
        if handle:
            if handle not in sessions_with_rooms:
                sessions_with_rooms[handle] = None

    active_user_data = ActiveUsersData(
        updated_at=datetime.now(pytz.UTC),
        active_users=sessions_with_rooms
    )
    await redis.setex(cache_key, ACTIVE_USERS_CACHE_SECONDS, pickle.dumps(active_user_data))

    return active_user_data
