import datetime
import math
import random
from datetime import timedelta

import pytest
import pytz
from sqlalchemy import desc

from src.app.core.enums import ContestType
from src.app.db.models.models import Member, User, Contest, ContestMember
from src.app.db.session import get_db
from src.app.schemas.schemas import ContestCreateRequest
from src.app.services.contest_services import register_contest, create_contest, handle_contest_end
from src.app.services.room_services import update_score
from src.app.utils.contest_utils import elo_update, codeforces_update
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
async def test_create_contest_with_10_users():
    """ 테스트 성공 이후에 서버를 재시작해야 scheduler에 의해 콘테스트가 준비됨 """
    db = next(get_db())
    cnt = db.query(Contest).count()
    contest_name = "changhw Contest Round" + str(cnt + 1)
    contest = Contest(
        name=contest_name,
        query="*s2..g2",
        type=ContestType.CONTEST_BOJ_GENERAL,
        missions_per_room=37,
        players_per_room=16,
        starts_at=datetime.datetime.now(pytz.UTC),
        ends_at=datetime.datetime.now(pytz.UTC) + timedelta(hours=2),
        is_rated=True
    )
    db.add(contest)
    db.flush()

    members = db.query(Member).limit(10)
    for member in members:
        contest_member = ContestMember(
            member_id=member.id,
            contest_id=contest.id,
        )
        db.add(contest_member)
    db.commit()

    contest_members = db.query(ContestMember).filter(ContestMember.contest_id == contest.id).all()
    assert len(contest_members) == 10

    db.close()


@pytest.mark.asyncio
async def test_random_solve():
    db = next(get_db())
    limit = 30
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
            rating = member.rating
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
