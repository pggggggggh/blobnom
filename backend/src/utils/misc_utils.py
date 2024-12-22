import os

from sqlalchemy.orm import joinedload

from src.models.models import Room
from src.services.room_services import update_score
from src.utils.security_utils import hash_password


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
