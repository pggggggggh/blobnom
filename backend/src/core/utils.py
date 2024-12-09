import math
from collections import deque
from datetime import datetime

import pytz
from fastapi import HTTPException
from sqlalchemy.orm import joinedload

from src.core.constants import MAX_TEAM_PER_ROOM, MAX_USER_PER_ROOM
from src.core.models import Room, RoomMission, RoomPlayer


async def update_score(room_id, db):
    room = (db.query(Room)
            .options(joinedload(Room.players)
                     .joinedload(RoomPlayer.user))
            .filter(Room.id == room_id).first())
    if not room:
        return
    print(str(room.id) + "doing")
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


async def get_solved_problem_list(problem_ids, username, db, client):
    paged_problem_ids = [problem_ids[i:i + 25] for i in range(0, len(problem_ids), 25)]

    solved_problem_list = []

    for problem_ids in paged_problem_ids:
        query = "("
        for problem_id in problem_ids:
            if len(query) > 1:
                query += "|"
            query += "id:" + str(problem_id)
        query += ") & @" + username
        response = await client.get("https://solved.ac/api/v3/search/problem",
                                    params={"query": query})
        print(query)
        items = response.json()["items"]
        for item in items:
            solved_problem_list.append(item["problemId"])

    return solved_problem_list


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

    for player in room_players:
        solved_problem_list = await get_solved_problem_list(problem_id_list, player.user.name, db, client)
        for mission in missions:
            if mission.problem_id in solved_problem_list:
                mission.solved_at = datetime.now(tz=pytz.utc) if not initial else room.starts_at
                mission.solved_user = player.user
                mission.solved_room_player = player
                mission.solved_team_index = player.team_index

    db.commit()
    db.refresh(mission)
    return


async def update_all_rooms(db):
    rooms = db.query(Room).all()
    for room in rooms:
        await update_score(room.id, db)
