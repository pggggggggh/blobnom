import math
from collections import deque
from datetime import datetime

import httpx
import pytz
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from starlette import status

from src.app.api.websocket_router import manager
from src.app.core.constants import MAX_TEAM_PER_ROOM, MAX_USER_PER_ROOM
from src.app.db.models.models import Room, RoomMission, RoomPlayer, Member
from src.app.schemas.schemas import RoomSummary, RoomDetail, RoomTeamInfo, RoomMissionInfo
from src.app.utils.solvedac_utils import fetch_problems, get_solved_problem_list


def get_room_summary(room: Room) -> RoomSummary:
    winner_team_index = room.winning_team_index
    winner_dict = [player.user.handle for player in room.players if player.team_index == winner_team_index]
    winner = ", ".join(winner_dict)

    return RoomSummary(
        id=room.id,
        name=room.name,
        starts_at=room.starts_at,
        ends_at=room.ends_at,
        owner=room.owner.handle if room.owner else "",
        num_players=len(room.players),
        max_players=room.max_players,
        num_missions=room.num_mission,
        num_solved_missions=len([mission for mission in room.missions if mission.solved_at is not None]),
        winner=winner,
        is_private=room.is_private,
    )


def get_room_detail(room_id: int, db: Session, handle: str) -> RoomDetail:
    room = (db.query(Room).filter(Room.id == room_id)
            .options(joinedload(Room.missions)
                     .joinedload(RoomMission.solved_room_player)
                     .joinedload(RoomPlayer.user))
            .options(joinedload(Room.players))
            .first())
    if not room or room.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    players = room.players
    is_user_in_room = False
    for player in players:
        if player.user.handle == handle:
            is_user_in_room = True
            break

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
        team_users[player.team_index].append(
            {"name": player.user.handle, "indiv_solved_cnt": player.indiv_solved_count})

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
            solved_user_name=mission.solved_room_player.user.handle if mission.solved_at else None
        )
        for mission in sorted(missions, key=lambda m: m.index_in_room)
    ]

    room_detail = RoomDetail(
        starts_at=room.starts_at,
        ends_at=room.ends_at,
        id=room.id,
        name=room.name,
        owner=room.owner.handle if room.owner else "",
        is_private=room.is_private,
        is_user_in_room=is_user_in_room,
        is_owner_a_member=True if db.query(Member).filter(
            Member.handle == room.owner.handle).first() is not None else False,
        mode_type=room.mode_type,
        num_missions=room.num_mission,
        team_info=room_team_info,
        mission_info=room_mission_info,
        is_started=room.is_started,
    )

    return room_detail


async def check_unstarted_rooms(db: Session):
    rooms = db.query(Room).filter(Room.is_started == False).all()
    for room in rooms:
        await handle_room_start(room.id, db)


async def handle_room_start(room_id: int, db: Session):
    print(f"{room_id} starting")

    try:
        room = (
            db.query(Room)
            .options(
                joinedload(Room.players),
                joinedload(Room.missions)
            )
            .filter(Room.id == room_id)
            .first()
        )
        if datetime.now(pytz.utc) < room.starts_at:
            return
        if not room:
            print(f"Room with id {room_id} not found.")
            return

        async with httpx.AsyncClient() as client:
            for player in room.players:
                room.query += f" !@{player.user.handle}"
            db.add(room)
            db.flush()
            problem_ids = await fetch_problems(room.query)
            if len(problem_ids) < room.num_mission:
                print(f"Room with id {room_id} has no sufficient problems.")
                room.is_deleted = True
                db.add(room)
                db.flush()
                db.commit()
                return
            problem_ids = problem_ids[:room.num_mission]

            for idx, problem_id in enumerate(problem_ids):
                mission = RoomMission(problem_id=problem_id, room_id=room.id, index_in_room=idx)
                db.add(mission)
                room.missions.append(mission)
            db.flush()
            await update_solver(room.id, room.missions, room.players, db, client, True)
            await update_score(room.id, db)
            room.is_started = True
            db.add(room)
            db.commit()

            print(f"Room {room_id} has started successfully.")

    except Exception as e:
        print(f"Error starting room {room_id}: {e}")


async def update_solver(room_id, missions, room_players, db, client, initial=False):
    # initial이 True면 방 만들 때
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=400, detail="Such room does not exist")

    problem_id_list = []
    for mission in missions:
        if mission is None:
            raise HTTPException(status_code=400, detail="Such problem does not exist")
        problem_id_list.append(mission.problem_id)

    newly_solved_problems = []
    for player in room_players:
        solved_problem_list = await get_solved_problem_list(problem_id_list, player.user.handle)
        print(player.user.handle)
        print(solved_problem_list)
        for mission in missions:
            if not mission.solved_at and mission.problem_id in solved_problem_list:
                newly_solved_problems.append(
                    {
                        "pid": mission.problem_id,
                        "username": player.user.handle,
                    }
                )
                mission.solved_at = datetime.now(pytz.utc) if not initial else room.starts_at
                mission.solved_user = player.user
                mission.solved_room_player = player
                mission.solved_team_index = player.team_index
                db.add(mission)
    db.commit()

    for problem in newly_solved_problems:
        await manager.broadcast({
            "type": "problem_solved",
            "problem_id": problem["pid"],
            "username": problem["username"],
        }, room_id)
    return


async def update_score(room_id, db):
    room = (db.query(Room)
            .options(joinedload(Room.players)
                     .joinedload(RoomPlayer.user))
            .filter(Room.id == room_id).first())
    if not room:
        return
    room_players = room.players

    missions = db.query(RoomMission).filter(RoomMission.room_id == room_id).all()
    num_mission = len(missions)
    board_width = ((3 + int(math.sqrt(12 * num_mission - 3))) // 6 - 1) * 2 + 1

    board = [[-1 for _ in range(board_width)] for _ in range(board_width)]
    solved_team_index = [-1 for _ in range(num_mission)]
    adjacent_solved_count_list = [0 for _ in range(MAX_TEAM_PER_ROOM)]
    total_solved_count_list = [0 for _ in range(MAX_TEAM_PER_ROOM)]
    last_solved_at_list = [room.created_at for _ in range(MAX_TEAM_PER_ROOM)]

    indiv_solved_count_list = [0 for _ in range(MAX_USER_PER_ROOM)]

    for mission in missions:
        index = mission.index_in_room
        if mission.solved_at is not None:
            cur_solved_player_index = mission.solved_room_player.player_index
            cur_solved_team_index = mission.solved_room_player.team_index

            solved_team_index[index] = cur_solved_team_index
            total_solved_count_list[cur_solved_team_index] += 1
            indiv_solved_count_list[cur_solved_player_index] += 1

            if (mission.solved_at.replace(tzinfo=pytz.UTC) >
                    last_solved_at_list[cur_solved_team_index].replace(tzinfo=pytz.UTC)):
                last_solved_at_list[cur_solved_team_index] = mission.solved_at

    ptr = 0
    for i in range(board_width):
        s = max(0, i - board_width // 2)
        for j in range(board_width - abs(i - board_width // 2)):
            board[s + j][i] = ptr
            ptr += 1
    graph = [[] for _ in range(num_mission)]
    for i in range(board_width):
        for j in range(board_width):
            if board[i][j] < 0: continue
            if j + 1 < board_width and board[i][j + 1] >= 0:
                graph[board[i][j]].append(board[i][j + 1])
                graph[board[i][j + 1]].append(board[i][j])
            if i + 1 < board_width and board[i + 1][j] >= 0:
                graph[board[i][j]].append(board[i + 1][j])
                graph[board[i + 1][j]].append(board[i][j])
            if i + 1 < board_width and j + 1 < board_width and board[i + 1][j + 1] >= 0:
                graph[board[i][j]].append(board[i + 1][j + 1])
                graph[board[i + 1][j + 1]].append(board[i][j])
    vis = [False for _ in range(num_mission)]
    for i in range(num_mission):
        if solved_team_index[i] < 0 or vis[i]: continue
        q = deque([])
        q.append(i)
        adjacent_count = 0
        while q:
            u = q.popleft()
            if vis[u]:
                continue
            vis[u] = True
            adjacent_count += 1
            for v in graph[u]:
                if solved_team_index[v] == solved_team_index[i]: q.append(v)
        adjacent_solved_count_list[solved_team_index[i]] = max(
            adjacent_solved_count_list[solved_team_index[i]],
            adjacent_count
        )

    for player in room_players:
        player.adjacent_solved_count = adjacent_solved_count_list[player.team_index]
        player.total_solved_count = total_solved_count_list[player.team_index]
        player.last_solved_at = last_solved_at_list[player.team_index]
        player.indiv_solved_count = indiv_solved_count_list[player.player_index]
        db.add(player)
    db.commit()

    sorted_players = sorted(
        room_players,
        key=lambda player: (
            -adjacent_solved_count_list[player.team_index],
            last_solved_at_list[player.team_index],
            -player.adjacent_solved_count,
            -player.total_solved_count,
            player.last_solved_at
        )
    )
    room.winning_team_index = sorted_players[0].team_index
    db.commit()
    return
