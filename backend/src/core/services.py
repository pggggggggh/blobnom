from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from src.core.models import User, Room, RoomPlayer, RoomMission
from src.core.schemas import RoomDetail, RoomSummary, RoomPlayerInfo, RoomMissionInfo

def get_room_summary(room: Room) -> RoomSummary:
    winner_team_index = room.winning_team_index
    winner_dict = [player.user.name for player in room.players if player.team_index == winner_team_index]
    winner = ", ".join(winner_dict)

    return RoomSummary(
        id = room.id,
        name = room.name,
        starts_at = room.starts_at,
        ends_at = room.ends_at,
        owner = room.owner.name if room.owner else "",
        num_players = len(room.players),
        max_players = room.max_players,
        num_missions = len(room.missions),
        num_solved_missions = len([mission for mission in room.missions if mission.solved_at is not None]),
        winner = winner,
        is_private = room.is_private,
    )

def get_room_detail(room_id: int, db: Session) -> RoomDetail:
    room = (db.query(Room).filter(Room.id == room_id)
            .options(joinedload(Room.missions)
                     .joinedload(RoomMission.solved_room_player)
                     .joinedload(RoomPlayer.user))
            .options(joinedload(Room.players))
            .first())
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    players = room.players
    room_player_info = [
        RoomPlayerInfo(
            user_id=player.user.id,
            name=player.user.name,
            player_index=player.player_index,
            adjacent_solved_count=player.adjacent_solved_count,
            total_solved_count=player.total_solved_count,
            last_solved_at=player.last_solved_at
        ) for player in players]

    missions = room.missions
    room_mission_info = [
        RoomMissionInfo(
            problem_id=mission.problem_id,
            solved_at=mission.solved_at,
            solved_player_index=mission.solved_room_player.player_index if mission.solved_at else None,
            solved_user_name=mission.solved_room_player.user.name if mission.solved_at else None
        )
        for mission in missions
    ]

    room_detail = RoomDetail(
        starts_at=room.starts_at,
        ends_at=room.ends_at,
        id=room.id,
        name=room.name,
        is_private=room.is_private,
        num_missions=len(missions),
        player_info=room_player_info,
        mission_info=room_mission_info
    )

    return room_detail
