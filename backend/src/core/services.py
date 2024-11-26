from models import Room
from src.core.schemas import RoomDetail, RoomSummary

def create_room_summary(room: Room) -> RoomSummary:
    return RoomSummary(
        id = room.id,
        name = room.name,
        begin = room.started_at,
        end = room.finished_at,
        public = not room.is_private,
        users = len(room.users),
        top_user = room.winner_user
    )
