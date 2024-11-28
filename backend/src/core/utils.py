import math
from collections import deque
from datetime import datetime, tzinfo
from fastapi import Body, HTTPException, Depends, APIRouter, status
import pytz
from sqlalchemy.orm import joinedload

from src.core.constants import MAX_USER_PER_ROOM
from src.core.models import User, Room, RoomPlayer, RoomMission


async def update_score(room_id, db):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        return

    room_players = (
        db.query(RoomPlayer)
        .options(joinedload(RoomPlayer.user))
    )
    missions = db.query(RoomMission).filter(RoomMission.room_id == room_id).all()

    num_mission = len(missions)
    board_width = (3+int(math.sqrt(12*num_mission-3)))//6

    board = [[-1 for _ in range(board_width)] for _ in range(board_width)]
    solved_player_index = [-1 for _ in range(num_mission)]


    adjacent_solved_count_list = [0 for _ in range(MAX_USER_PER_ROOM)]
    total_solved_count_list = [0 for _ in range(MAX_USER_PER_ROOM)]
    last_solved_at_list = [room.created_at for _ in range(MAX_USER_PER_ROOM)]

    for index, mission in enumerate(missions):
        if mission.solved_at is not None:
            cur_solved_index = mission.solved_room_player.player_index
            # indicates the player_index in room
            solved_player_index[index] = cur_solved_index
            total_solved_count_list[cur_solved_index] += 1
            if (mission.solved_at.replace(tzinfo=pytz.UTC) >
                    last_solved_at_list[cur_solved_index].replace(tzinfo=pytz.UTC)):
                last_solved_at_list[cur_solved_index] = mission.solved_at

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
        if solved_player_index[i] < 0 or vis[i]: continue
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
                if solved_player_index[v] == solved_player_index[i]: q.append(v)
        adjacent_solved_count_list[solved_player_index[i]] = max(
            adjacent_solved_count_list[solved_player_index[i]],
            adjacent_count
        )

    for player in room_players:
        player.adjacent_solved_count = adjacent_solved_count_list[player.player_index]
        player.total_solved_count = total_solved_count_list[player.player_index]
        player.last_solved_at = last_solved_at_list[player.player_index]
        db.add(player)
    db.commit()

    # 같은 객체 다시 쿼리할 필요 X
    sorted_players = sorted(
        room_players,
        key=lambda user: (
            -user.adjacent_solved_count,   # 내림차순
            -user.total_solved_count,      # 내림차순
            user.last_solved_at            # 오름차순
        )
    )

    room.winning_player_id = sorted_players[0].id
    room.winning_user_id = sorted_players[0].user_id
    db.commit()
    return


async def get_solved_mission_list(room_id, username, db, client):
    missions = db.query(RoomMission).filter(RoomMission.room_id == room_id).all()
    problem_ids = [mission.problem_id for mission in missions if mission.solved_at is None]
    paged_problem_ids = [problem_ids[i:i + 50] for i in range(0, len(problem_ids), 50)]

    solved_problem_list = []

    for problem_ids in paged_problem_ids:
        query = ""
        for problem_id in problem_ids:
            if len(query) > 0:
                query += "|"
            query += "id:" + str(problem_id)
        query += " @" + username
        response = await client.get("https://solved.ac/api/v3/search/problem",
                                    params={"query": query})
        items = response.json()["items"]
        for item in items:
            solved_problem_list.append(item["problemId"])
    
    return solved_problem_list


async def update_solver(room_id, mission, room_players, db, client):
    if mission is None:
        raise HTTPException(status_code=400,detail="Such problem does not exist")
    # if mission.solved_at is not None:
    #     raise HTTPException(status_code=400, detail="The problem was already solved")

    for player in room_players:
        solved_problem_list = await get_solved_mission_list(room_id,player.user.name,db,client)
        if mission.problem_id in solved_problem_list:
            mission.solved_at = datetime.now(tz=pytz.utc)
            mission.solved_user = player.user
            mission.solved_room_player = player
            break

    db.commit()
    db.refresh(mission)
    return
