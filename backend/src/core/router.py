import random
from datetime import datetime

import httpx
import pytz
from fastapi import Body, HTTPException, Depends, APIRouter, status
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from src.core.constants import MAX_TEAM_PER_ROOM
from src.core.enums import ModeType
from src.core.models import User, Room, RoomPlayer, RoomMission
from src.core.services import get_room_summary, get_room_detail
from src.core.utils import update_score, update_solver, get_solved_problem_list
from src.database import get_db

router = APIRouter()


@router.get("/")
async def room_list(db: Session = Depends(get_db)):
    rooms = (
        db.query(Room)
        .options(joinedload(Room.players))
        .options(joinedload(Room.missions))
        .options(joinedload(Room.owner))
        .order_by(desc(Room.updated_at))
        .all()
    )

    room_list = []
    for room in rooms:
        room_data = get_room_summary(room)
        room_list.append(room_data)

    return room_list


@router.get("/rooms/detail/{id}")
async def room_detail(id: int, db: Session = Depends(get_db)):
    return get_room_detail(room_id=id, db=db)


@router.post("/rooms/join/{id}")
async def room_join(id: int, handle: str = Body(...), db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        room = db.query(Room).options(joinedload(Room.missions)).filter(Room.id == id).first()
        if not room:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
        if room.mode_type == ModeType.LAND_GRAB_MULT:
            raise HTTPException(status_code=400, detail="팀전에는 참여할 수 없습니다.")

        room_players = (
            db.query(RoomPlayer)
            .options(joinedload(RoomPlayer.user))
            .filter(RoomPlayer.room_id == id)
            .all()
        )

        if len(room_players) >= MAX_TEAM_PER_ROOM:
            raise HTTPException(status_code=400, detail="인원이 가득 찼습니다.")

        if any(player.user.name == handle for player in room_players):
            raise HTTPException(status_code=400, detail="이미 존재하는 유저입니다.")

        query = "@" + handle
        response = await client.get("https://solved.ac/api/v3/search/problem",
                                    params={"query": query})

        if len(response.json()["items"]) == 0:
            raise HTTPException(status_code=400, detail="유효하지 않은 핸들입니다.")

        if not db.query(User).filter(User.name == handle).first():
            user = User(name=handle)
            db.add(user)
            db.flush()
        user = db.query(User).filter(User.name == handle).first()

        unsolved_problem_ids = [mission.problem_id for mission in room.missions if mission.solved_at is None]
        solved_mission_list = await get_solved_problem_list(unsolved_problem_ids, handle, db, client)
        if len(solved_mission_list) > 2:
            raise HTTPException(status_code=400, detail="이미 해결한 문제가 2문제를 초과하여 참여할 수 없습니다.")

        # calculate mex
        player_indices = {player.player_index for player in room_players}
        player_index = next(i for i in range(len(player_indices) + 1) if i not in player_indices)

        team_indices = {player.team_index for player in room_players}
        team_index = next(i for i in range(len(team_indices) + 1) if i not in team_indices)

        player = RoomPlayer(
            user_id=user.id,
            room_id=room.id,
            player_index=player_index,
            team_index=team_index,
            last_solved_at=room.starts_at
        )
        room.players.append(player)
        db.add(player)

        missions = db.query(RoomMission).filter(
            RoomMission.problem_id.in_(solved_mission_list),
            RoomMission.room_id == id
        ).all()

        for mission in missions:
            mission.solved_at = room.starts_at
            mission.solved_room_player_id = player.id
            mission.solved_team_index = team_index
            mission.solved_user = user

        db.commit()

        await update_score(id, db)
        return {"success": True}


@router.post("/rooms/solved/")
async def room_refresh(room_id: int = Body(...), problem_id: int = Body(...), db: Session = Depends(get_db)):
    room = (db.query(Room)
            .options(joinedload(Room.players))
            .options(joinedload(Room.missions))
            .filter(Room.id == room_id)
            .first())

    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    if datetime.now(tz=pytz.UTC) > room.ends_at:
        raise HTTPException(status_code=400, detail="The room has already ended")

    mission = None
    for m in room.missions:
        if m.problem_id == problem_id:
            mission = m
            break

    async with httpx.AsyncClient() as client:
        room_players = room.players
        random.shuffle(room_players)
        await update_solver(room_id, mission, room_players, db, client)
        await update_score(room_id, db)


@router.post("/rooms/create")
async def room_create(db: Session = Depends(get_db),
                      owner_handle: str = Body(...),
                      handles: str = Body(...),
                      title: str = Body(...),
                      query: str = Body(...),
                      size: int = Body(...),
                      mode: ModeType = Body(...),
                      is_private: bool = Body(...),
                      max_players: int = Body(...),
                      starts_at: datetime = Body(...),
                      ends_at: datetime = Body(...)):
    if max_players > MAX_TEAM_PER_ROOM:
        raise HTTPException(status_code=400)

    owner = db.query(User).filter(User.name == owner_handle).first()
    if not owner:
        owner = User(name=owner_handle)
        db.add(owner)
        db.flush()

    async with httpx.AsyncClient() as client:
        handles = handles.split()

        problem_ids = []
        for _ in range(4):
            response = await client.get("https://solved.ac/api/v3/search/problem",
                                        params={"query": query, "sort": "random", "page": 1})
            tmp = response.json()["items"]
            for item in tmp:
                if item["problemId"] not in problem_ids:
                    problem_ids.append(item["problemId"])
        num_mission = 3 * size * (size + 1) + 1

        if len(problem_ids) < num_mission:
            raise HTTPException(status_code=400, detail="쿼리에 해당하는 문제 수가 적어 방을 만드는데 실패했습니다.")
        problem_ids = problem_ids[:num_mission]

        room = Room(
            name=title,
            query=query,
            owner=owner,
            mode_type=mode,
            max_players=max_players,
            starts_at=starts_at,
            ends_at=ends_at,
            is_private=is_private
        )
        db.add(room)
        db.flush()

        for idx, problem_id in enumerate(problem_ids):
            mission = RoomMission(problem_id=problem_id, room_id=room.id, index_in_room=idx)
            room.missions.append(mission)
            db.add(mission)
            db.flush()

        for idx, username in enumerate(handles):
            user = db.query(User).filter(User.name == username).first()
            if not user:
                user = User(name=username)
                db.add(user)
                db.flush()
            room_player = RoomPlayer(
                user_id=user.id,
                room_id=room.id,
                player_index=idx,
                team_index=idx  # 테스트를 위한 것임!!!
            )
            room.players.append(room_player)
            db.add(room_player)
        db.commit()

        return {"success": True, "roomId": room.id}
