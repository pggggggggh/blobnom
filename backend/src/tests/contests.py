import datetime
import math
import random
from datetime import timedelta

import pytest
import pytz
from sqlalchemy import desc

from src.app.core.constants import REGISTER_DEADLINE_SECONDS
from src.app.core.enums import ContestType
from src.app.db.models.models import Member, User, Contest, ContestMember
from src.app.db.session import get_db
from src.app.schemas.schemas import ContestCreateRequest
from src.app.services.contest_services import register_contest, create_contest, handle_contest_end, handle_contest_ready
from src.app.services.room_services import update_score
from src.app.utils.contest_utils import elo_update, codeforces_update
from src.app.utils.scheduler import add_job
from src.app.utils.security_utils import hash_password


@pytest.mark.asyncio
async def test_create_user():
    db = next(get_db())
    for i in range(1, 51):
        if db.query(Member).filter(Member.handle == f"changhw{i}").first() is not None:
            raise Exception

        member = Member(
            handle=f"changhw{i}",
            email=f"changhw{i}@changhw.org",
            password=hash_password("changhw"),
        )
        db.add(member)
        db.flush()
        user = User(
            handle=f"changhw{i}",
            member_id=member.id
        )
        db.add(user)
        db.flush()
    for i in range(1, 51):
        member = db.query(Member).filter(Member.handle == f"changhw{i}").first()
        assert member is not None

    db.commit()
    db.close()


@pytest.mark.asyncio
async def test_create_contest_with_50_users():
    db = next(get_db())
    cnt = db.query(Contest).count()
    contest_name = "changhw Contest Round " + str(cnt + 1)
    contest = Contest(
        name=contest_name,
        query="*s2..g2",
        type=ContestType.CONTEST_BOJ_GENERAL,
        missions_per_room=37,
        players_per_room=8,
        starts_at=datetime.datetime.now(pytz.UTC),
        ends_at=datetime.datetime.now(pytz.UTC) + timedelta(hours=2),
        is_rated=False
    )
    db.add(contest)
    db.flush()

    members = db.query(Member).limit(50).all()
    for member in members:
        contest_member = ContestMember(
            member_id=member.id,
            contest_id=contest.id,
        )
        db.add(contest_member)
    db.commit()

    add_job(
        handle_contest_ready,
        run_date=contest.starts_at - timedelta(seconds=REGISTER_DEADLINE_SECONDS),
        args=[contest.id],
        job_id=f"contest_ready_{contest.id}"
    )

    contest_members = db.query(ContestMember).filter(ContestMember.contest_id == contest.id).all()
    assert len(contest_members) == 50

    db.close()


@pytest.mark.asyncio
async def test_random_solve():
    db = next(get_db())
    limit = 15
    contest = db.query(Contest).order_by(desc(Contest.created_at)).first()
    contest_id = contest.id

    for contest_room in contest.contest_rooms:
        room = contest_room.room
        room_id = room.id
        players = room.players

        room_missions = room.missions
        random.shuffle(room_missions)

        ratings = []
        for player in players:
            handle = player.user.handle
            member = db.query(Member).filter(Member.handle == handle).first()
            if handle[-1] == "h" or handle[-1] == "0":
                rating = 1
            else:
                rating = (11 - int(handle[-1])) ** 3
            ratings.append(rating)

        for mission in room_missions[:limit]:
            if mission.solved_at:
                continue
            player = random.choices(players, weights=ratings, k=1)[0]
            mission.solved_at = datetime.datetime.now(pytz.utc)
            mission.solved_user = player.user
            mission.solved_room_player = player
            mission.solved_team_index = player.team_index
            db.add(mission)
            room.num_solved_missions += 1
            room.last_solved_at = mission.solved_at
            db.add(room)
            db.commit()

        await update_score(room_id, db)

    await handle_contest_end(contest_id)
    db.close()
