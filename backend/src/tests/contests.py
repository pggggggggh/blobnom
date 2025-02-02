import datetime
import random
from datetime import timedelta

import pytest
import pytz

from src.app.core.enums import ContestType
from src.app.db.models.models import Member, User, Contest, ContestMember
from src.app.db.session import get_db
from src.app.schemas.schemas import ContestCreateRequest
from src.app.services.contest_services import create_contest, register_contest
from src.app.services.room_services import update_score
from src.app.utils.security_utils import hash_password


@pytest.mark.asyncio
async def test_create_user():
    db = next(get_db())
    for i in range(1, 51):
        if db.query(Member).filter(Member.handle == f"changhw{i}"):
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
    contest_name = "changhw contest " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    await create_contest(
        ContestCreateRequest(
            name=contest_name,
            query="@changhw",
            type=ContestType.CONTEST_BOJ_GENERAL,
            missions_per_room=61,
            players_per_room=8,
            starts_at=datetime.datetime.now(pytz.UTC) + timedelta(minutes=6),
            ends_at=datetime.datetime.now(pytz.UTC) + timedelta(hours=2),
        ), db, "pgggggggggh"
    )

    contest = db.query(Contest).filter(Contest.name == contest_name).first()
    assert contest is not None

    for i in range(1, 51):
        handle = f"changhw{i}"
        result = await register_contest(contest.id, db, handle)
        assert result.get("message", "") is not None

    contest_members = db.query(ContestMember).filter(ContestMember.contest_id == contest.id).all()
    assert len(contest_members) == 50

    db.close()


@pytest.mark.asyncio
async def test_random_solve():
    db = next(get_db())
    contest_id = 6
    limit = 30
    contest = db.query(Contest).filter(Contest.id == contest_id).first()

    for contest_room in contest.contest_rooms:
        room = contest_room.room
        room_id = room.id
        players = room.players

        room_missions = room.missions
        random.shuffle(room_missions)

        for mission in room_missions[:limit]:
            if mission.solved_at:
                continue
            player = random.choice(players)
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

    db.close()
