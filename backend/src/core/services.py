from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from src.core.constants import MAX_TEAM_PER_ROOM
from src.core.models import Room, RoomPlayer, RoomMission
from src.core.schemas import RoomDetail, RoomSummary, RoomTeamInfo, RoomMissionInfo


def get_room_summary(room: Room) -> RoomSummary:
    winner_team_index = room.winning_team_index
    winner_dict = [player.user.name for player in room.players if player.team_index == winner_team_index]
    winner = ", ".join(winner_dict)

    return RoomSummary(
        id=room.id,
        name=room.name,
        starts_at=room.starts_at,
        ends_at=room.ends_at,
        owner=room.owner.name if room.owner else "",
        num_players=len(room.players),
        max_players=room.max_players,
        num_missions=len(room.missions),
        num_solved_missions=len([mission for mission in room.missions if mission.solved_at is not None]),
        winner=winner,
        is_private=room.is_private,
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
    team_users = [[] for _ in range(MAX_TEAM_PER_ROOM)]  # 닉네임, indiv_solved_count
    team_adj_solved_count_list = [0 for _ in range(MAX_TEAM_PER_ROOM)]
    team_total_solved_count_list = [0 for _ in range(MAX_TEAM_PER_ROOM)]
    team_last_solved_at_list = [None for _ in range(MAX_TEAM_PER_ROOM)]

    team_indexes = set()
    for player in players:
        team_indexes.add(player.team_index)
        team_adj_solved_count_list[player.team_index] = player.adjacent_solved_count
        team_total_solved_count_list[player.team_index] = player.total_solved_count
        team_last_solved_at_list[player.team_index] = player.last_solved_at
        team_users[player.team_index].append({"name": player.user.name, "indiv_solved_cnt": player.indiv_solved_count})

    room_team_info = sorted([
        RoomTeamInfo(
            users=sorted(team_users[team_index], key=lambda x: (-x["indiv_solved_cnt"])),
            team_index=team_index,
            adjacent_solved_count=team_adj_solved_count_list[team_index],
            total_solved_count=team_total_solved_count_list[team_index],
            last_solved_at=team_last_solved_at_list[team_index]
        ) for team_index in team_indexes],
        key=lambda x: (-x.adjacent_solved_count, -x.total_solved_count, x.last_solved_at))

    missions = room.missions
    room_mission_info = [
        RoomMissionInfo(
            problem_id=mission.problem_id,
            index_in_room=mission.index_in_room,
            solved_at=mission.solved_at,
            solved_player_index=mission.solved_room_player.player_index if mission.solved_at else None,
            solved_team_index=mission.solved_room_player.team_index if mission.solved_at else None,
            solved_user_name=mission.solved_room_player.user.name if mission.solved_at else None
        )
        for mission in sorted(missions, key=lambda m: m.index_in_room)
    ]

    room_detail = RoomDetail(
        starts_at=room.starts_at,
        ends_at=room.ends_at,
        id=room.id,
        name=room.name,
        is_private=room.is_private,
        mode_type=room.mode_type,
        num_missions=len(missions),
        team_info=room_team_info,
        mission_info=room_mission_info
    )

    return room_detail
