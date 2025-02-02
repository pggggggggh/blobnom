import os
from datetime import timedelta, datetime

import pytz
from sqlalchemy.orm import joinedload

from src.app.core.constants import REGISTER_DEADLINE_SECONDS
from src.app.db.models.models import Room, Contest
from src.app.db.session import get_db
from src.app.services.contest_services import handle_contest_ready
from src.app.services.room_services import update_score, handle_room_ready
from src.app.utils.logger import logger
from src.app.utils.scheduler import add_job
from src.app.utils.security_utils import hash_password


async def update_all_rooms(db):
    rooms = (db.query(Room)
             .options(joinedload(Room.missions))
             .all())
    for room in rooms:
        await update_score(room.id, db)
        room.num_mission = len(room.missions)
        if room.is_private and room.entry_pwd is None:
            room.entry_pwd = hash_password(os.environ.get("DEFAULT_PWD"))
        if room.edit_pwd is None:
            room.edit_pwd = hash_password(os.environ.get("DEFAULT_PWD"))


async def check_unstarted_events():
    db = next(get_db())
    rooms = db.query(Room).filter(Room.is_started == False).filter(Room.is_deleted == False).all()
    for room in rooms:
        add_job(
            handle_room_ready,
            run_date=max(room.starts_at - timedelta(seconds=REGISTER_DEADLINE_SECONDS),
                         datetime.now(pytz.UTC) + timedelta(seconds=5)),
            args=[room.id],
        )
        logger.info(f"Room {room.id} will start at {room.starts_at}")

    contests = db.query(Contest).filter(Contest.is_started == False).filter(Contest.is_deleted == False).all()
    for contest in contests:
        add_job(
            handle_contest_ready,
            run_date=contest.starts_at - timedelta(seconds=REGISTER_DEADLINE_SECONDS),
            args=[contest.id],
        )
        logger.info(f"Contest {contest.id} will start at {contest.starts_at}")
