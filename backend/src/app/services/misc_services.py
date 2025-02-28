import pickle
from datetime import datetime

import pytz
from sqlalchemy.orm import Session, joinedload

from src.app.core.constants import STATS_CACHE_SECONDS
from src.app.core.socket import sio
from src.app.db.models.models import RoomMission, Member
from src.app.db.redis import get_redis
from src.app.schemas.schemas import SiteStats, LeaderboardEntry, Leaderboards
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

    members = db.query(Member).options(joinedload(Member.users)).all()
    member_list = []
    for member in members:
        num_solved_missions = 0
        for user in member.users:
            num_solved_missions += db.query(RoomMission).filter(RoomMission.solved_user_id == user.id).count()
        member_list.append([member, num_solved_missions * 10, num_solved_missions])
    member_list.sort(key=lambda x: x[1], reverse=True)

    sliced_member_list = member_list[offset:offset + limit]
    updated_at = datetime.now(pytz.UTC)

    leaderboards = []
    for member, points, num_solved_missions in sliced_member_list:
        leaderboards.append(
            LeaderboardEntry(
                member_summary=await convert_to_member_summary(member, db),
                points=points,
                num_solved_missions=num_solved_missions,
            )
        )

    leaderboards_data = Leaderboards(updated_at=updated_at, leaderboards=leaderboards)

    if redis:
        await redis.set(cache_key, pickle.dumps(leaderboards_data))

    return leaderboards_data
