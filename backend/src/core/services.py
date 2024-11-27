from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from src.core.models import User, Room, RoomPlayer, RoomMission
from src.core.schemas import RoomDetail, RoomSummary
from src.core.schemas import RoomPlayerInfo, RoomMissionInfo, RoomDetail

def get_room_summary(room: Room) -> RoomSummary:
    return RoomSummary(
        id = room.id,
        name = room.name,
        starts_at = room.starts_at,
        ends_at = room.ends_at,
        num_players = len(room.players),
        max_players = room.max_players,
        is_private = room.is_private,
    )

def get_room_detail(room_id: int, db: Session) -> RoomDetail:
    room = db.query(Room).filter(Room.id == id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    players = (
        db.query(RoomPlayer)
        .options(joinedload(RoomPlayer.user))
        .filter(RoomPlayer.room_id == id)
        .all()
    )
    room_player_info = [
        RoomPlayerInfo(
            user_id=player.user.id,
            name=player.user.name,
            user_index=player.user_index,
            adjacent_solved_count=player.adjacent_solved_count,
            total_solved_count=player.total_solved_count,
            last_solved_at=player.last_solved_at
        ) for player in players]

    missions = (db.query(RoomMission)
                .filter(RoomMission.room_id == id).all())
    room_mission_info = [
        RoomMissionInfo(
            problem_id=mission.problem_id,
            solved_at=mission.solved_at,
            solved_user_id=mission.solved_user_id
        )
        for mission in missions
    ]

    room_detail = RoomDetail(
        begin=room.starts_at,
        end=room.ends_at,
        id=room.id,
        name=room.name,
        is_private=room.is_private,
        user_room_info=room_player_info,
        problem_room_info=room_mission_info
    )

    return room_detail
