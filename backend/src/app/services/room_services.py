import asyncio
import json
import math
import pickle
from collections import deque
from datetime import datetime, timedelta
from typing import Optional

import httpx
import pytz
from fastapi import HTTPException, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload
from starlette import status

from src.app.core.socket import sio
from src.app.core.constants import MAX_TEAM_PER_ROOM, MAX_USER_PER_ROOM, ROOM_CACHE_SECONDS
from src.app.db.models.models import Room, RoomMission, RoomPlayer, Member, Contest
from src.app.db.redis import get_redis
from src.app.db.session import get_db, SessionLocal
from src.app.schemas.schemas import RoomSummary, RoomDetail, RoomTeamInfo, RoomMissionInfo, RoomListRequest
from src.app.services.member_services import convert_to_user_summary, convert_to_member_summary
from src.app.services.socket_services import get_sids_in_room, send_system_message
from src.app.utils.contest_utils import get_contest_summary
from src.app.utils.logger import logger
from src.app.utils.scheduler import add_job
from src.app.utils.platforms_utils import fetch_problems, get_solved_problem_list


async def get_room_summary(room: Room, db: Session) -> RoomSummary:
    return RoomSummary(
        id=room.id,
        name=room.name,
        platform=room.platform,
        starts_at=room.starts_at,
        ends_at=room.ends_at,
        owner=await convert_to_member_summary(room.owner, db) if room.owner else None,
        num_players=len(room.players),
        max_players=room.max_players,
        num_missions=room.num_mission,
        num_solved_missions=room.num_solved_missions,
        winner=room.winner,
        is_private=room.is_private,
        is_contest_room=room.is_contest_room,
    )


async def get_room_list(room_list_request: RoomListRequest, db: Session, handle: str = None):
    query = (
        db.query(Room)
        .options(joinedload(Room.owner))
        .filter(Room.name.ilike(f"%{room_list_request.search}%"))
        .filter(Room.is_deleted == False)
        .filter(Room.is_contest_room == False)
        .order_by(desc(Room.last_solved_at))
    )

    if room_list_request.activeOnly:
        query = (query
                 .filter(Room.is_private == False)
                 .filter(Room.ends_at > datetime.now(tz=pytz.UTC))
                 )
    if room_list_request.myRoomOnly and handle is not None:  # 비회원으로 요청 들어온 경우 무시
        member = db.query(Member).filter(Member.handle == handle).first()
        ids = []
        for user in member.users:
            ids.append(user.id)
        query = query.join(RoomPlayer).filter(RoomPlayer.user_id.in_(ids))

    total_rooms = query.count()
    rooms = (
        query.offset(20 * room_list_request.page)
        .limit(20)
        .all()
    )

    room_list = []
    for room in rooms:
        room_data = await get_room_summary(room, db)
        room_list.append(room_data)

    contests = db.query(Contest).filter(Contest.ends_at > datetime.now(tz=pytz.UTC)).order_by(
        desc(Contest.starts_at)).limit(1)

    contest_list = []
    for contest in contests:
        contest_data = get_contest_summary(contest)
        contest_list.append(contest_data)

    return {"room_list": room_list, "upcoming_contest_list": contest_list, "total_pages": math.ceil(total_rooms / 20)}


async def get_room_detail(room_id: int, db: Session, handle: Optional[str],
                          without_mission_info: bool = False) -> RoomDetail:
    redis = await get_redis()
    cache_key = f"room:{room_id}:details"
    if without_mission_info:
        cache_key += ":without_mission_info"

    # if redis:
    #     cached_data = await redis.get(cache_key)
    #     if cached_data:
    #         return pickle.loads(cached_data)

    query = db.query(Room).filter(Room.id == room_id)
    if not without_mission_info:
        query = query.options(
            joinedload(Room.missions)
            .joinedload(RoomMission.solved_room_player)
            .joinedload(RoomPlayer.user)
        )
    query = query.options(joinedload(Room.players))
    room = query.first()

    if not room or room.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    players = room.players
    is_user_in_room = False
    your_unsolvable_mission_ids = []
    for player in players:
        if player.user.member and player.user.member.handle == handle:
            your_unsolvable_mission_ids = player.unsolvable_mission_ids
            is_user_in_room = True
            break

    team_users = [[] for _ in range(MAX_TEAM_PER_ROOM)]  # 닉네임, indiv_solved_count
    team_adj_solved_count_list = [0 for _ in range(MAX_TEAM_PER_ROOM)]
    team_total_solved_count_list = [0 for _ in range(MAX_TEAM_PER_ROOM)]
    team_last_solved_at_list = [None for _ in range(MAX_TEAM_PER_ROOM)]
    team_indexes = {player.team_index for player in players}

    user_summary_tasks = [convert_to_user_summary(player.user, db) for player in players]
    user_summaries = await asyncio.gather(*user_summary_tasks)

    for player, user_info in zip(players, user_summaries):
        team_adj_solved_count_list[player.team_index] = player.adjacent_solved_count
        team_total_solved_count_list[player.team_index] = player.total_solved_count
        team_last_solved_at_list[player.team_index] = player.last_solved_at
        team_users[player.team_index].append(
            {"user": user_info, "indiv_solved_cnt": player.indiv_solved_count}
        )

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
    show_difficulty = room.unfreeze_offset_minutes is None or datetime.now(pytz.UTC) > room.ends_at - timedelta(
        minutes=room.unfreeze_offset_minutes)

    if without_mission_info or not room.is_started:
        room_mission_info = []
    else:
        room_mission_info = [
            RoomMissionInfo(
                id=mission.id,
                platform=mission.platform,
                problem_id=mission.problem_id,
                index_in_room=mission.index_in_room,
                solved_at=mission.solved_at,
                solved_player_index=mission.solved_room_player.player_index if mission.solved_at else None,
                solved_team_index=mission.solved_room_player.team_index if mission.solved_at else None,
                solved_user_name=mission.solved_room_player.user.handle if mission.solved_at else None,
                difficulty=mission.difficulty if show_difficulty or mission.solved_at else None
            )
            for mission in sorted(missions, key=lambda m: m.index_in_room)
        ]

    is_owner_a_member = True if room.owner is not None and (db.query(Member).filter(
        Member.handle == room.owner.handle).first() is not None) else False

    room_detail = RoomDetail(
        starts_at=room.starts_at,
        ends_at=room.ends_at,
        id=room.id,
        name=room.name,
        query=room.query,
        platform=room.platform,
        is_owner_a_member=is_owner_a_member,
        owner=room.owner.handle if room.owner else "",
        is_private=room.is_private,
        is_user_in_room=is_user_in_room,
        mode_type=room.mode_type,
        num_missions=room.num_mission,
        team_info=room_team_info,
        mission_info=room_mission_info,
        is_started=room.is_started,
        is_contest_room=room.is_contest_room,
        your_unsolvable_mission_ids=your_unsolvable_mission_ids
    )
    if redis:
        await redis.setex(cache_key, ROOM_CACHE_SECONDS, pickle.dumps(room_detail))

    return room_detail


# open new session, since it is a scheduled job
async def handle_room_ready(room_id: int):
    db: Session = SessionLocal()
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
        if not room:
            logger.info(f"Room with id {room_id} not found.")
            return

        if len(room.missions):  # already set, just start
            add_job(
                handle_room_start,
                run_date=max(room.starts_at, datetime.now(pytz.utc)),
                args=[room.id],
                job_id=f"room_start_{room_id}"
            )
            return

        logger.info(f"{room_id} getting ready")

        new_query = room.query
        for player in room.players:
            new_query += f" !@{player.user.handle}"

        logger.info(new_query)
        problems = await fetch_problems(new_query, room.num_mission, room.platform)
        if len(problems) < room.num_mission:
            logger.info(f"Room with id {room_id} has no sufficient problems.")
            room.is_deleted = True
            db.add(room)
            db.commit()
            return

        room.query = new_query
        db.add(room)
        db.commit()

        problems = problems[:room.num_mission]

        for idx, problem in enumerate(problems):
            mission = RoomMission(problem_id=problem["id"], difficulty=problem["difficulty"], room_id=room.id,
                                  index_in_room=idx, platform=room.platform)
            db.add(mission)
            room.missions.append(mission)
        db.add(room)
        db.commit()

        add_job(
            handle_room_start,
            run_date=room.starts_at,
            args=[room.id],
            job_id=f"room_start_{room.id}"
        )

        logger.info(f"Room {room_id} has set successfully. Will start at {room.starts_at}")
    except Exception as e:
        logger.info(f"Error setting room {room_id}: {e}")
    finally:
        db.close()


async def handle_room_start(room_id: int, db: Session = None):
    if db is None:
        db = next(get_db())
    room = (
        db.query(Room)
        .filter(Room.id == room_id)
        .first()
    )
    if room is None or room.is_started or room.is_deleted:
        return
    room.is_started = True
    db.add(room)
    db.commit()

    redis = await get_redis()
    if redis:
        cache_key = f"room:{room_id}:details"
        await redis.delete(cache_key)
    await sio.emit("room_started", room=f"room_{room_id}")

    logger.info(f"Room {room_id} has started successfully.")


async def update_solver(room_id, missions, room_players, db, client, initial=False):
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
        solved_problem_list = await get_solved_problem_list(problem_id_list, player.user.handle, room.platform)
        for mission in missions:
            if mission.id in player.unsolvable_mission_ids:
                continue
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
                room.num_solved_missions += 1
                room.last_solved_at = mission.solved_at
                db.add(room)
    db.commit()

    if initial is not True:
        if len(newly_solved_problems) == 0:
            return False

        for problem in newly_solved_problems:
            await sio.emit("problem_solved",
                           {"problem_id": problem["pid"], "username": problem["username"]},
                           room=f"room_{room_id}")
            await send_system_message(f'{problem["username"]}가 {problem["pid"]}를 해결하였습니다.', room_id)

    return True


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
    winner_dict = [player.user.handle for player in room_players if player.team_index == room.winning_team_index]
    room.winner = ", ".join(winner_dict)
    db.add(room)
    db.commit()

    return
