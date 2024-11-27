import random
from datetime import datetime

import httpx
from fastapi import Body, HTTPException, Depends, APIRouter, status
from sqlalchemy import func, desc
from sqlalchemy.orm import Session, joinedload

from src.database import get_db
from src.core.constants import MAX_USER_PER_ROOM, korea_tz
from src.core.models import User, Room, RoomPlayer, RoomMission
from src.core.utils import update_score, update_solver, get_solved_mission_list
from src.core.services import get_room_summary, get_room_detail

router = APIRouter()

@router.get("/")
async def room_list(db: Session = Depends(get_db)):
    rooms = (
        db.query(Room)
        .options(joinedload(Room.players))
        .order_by(desc(Room.updated_at))
        .all()
    )

    room_list = []
    for room in rooms:
        room_data = get_room_summary(room)
        room_list.append(room_data)

    return room_list


@router.get("/room/info/{id}")
async def room_detail(id: int, db: Session = Depends(get_db)):
    return get_room_detail(room_id=id, db=db)


@router.post("/room/join/{id}")
async def room_join(id: int, handle: str = Body(...), db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        room = db.query(Room).filter(Room.id == id).first()
        if not room:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

        room_players = (
            db.query(RoomPlayer)
            .options(joinedload(RoomPlayer.user))
            .filter(RoomPlayer.room_id == id)
            .all()
        )

        if len(room_players) >= MAX_USER_PER_ROOM:
            raise HTTPException(status_code=400, detail="인원이 가득 찼습니다.")

        if any(user.name == handle for (user_room, user) in room_players):
            raise HTTPException(status_code=400, detail="이미 존재하는 유저입니다.")

        query = "@" + handle
        response = await client.get("https://solved.ac/api/v3/search/problem",
                                    params={"query": query})

        if len(response.json()["items"]) == 0:
            raise HTTPException(status_code=400, detail="유효하지 않은 핸들입니다.")

        if not db.query(User).filter(User.name == handle).first():
            user = User(name=handle)
            db.add(user)
            db.commit()
            db.refresh(user)
        user = db.query(User).filter(User.name == handle).first()
        
        solved_mission_list = get_solved_mission_list(id, handle, db, client)

        if len(solved_mission_list) > 2:
            raise HTTPException(status_code=400, detail="이미 해결한 문제가 2문제를 초과하여 참여할 수 없습니다.")

        player = RoomPlayer(
            user_id=user.id,
            room_id=id,
        )
        db.add(player)
        db.commit()

        missions = db.query(RoomMission).filter(
            RoomMission.problem_id.in_(solved_mission_list),
            RoomMission.room_id == id
        ).all()

        for mission in missions:
            mission.solved_at = room.started_at
            mission.solved_room_player_id = player.id
            mission.solved_user_id = user.id

            db.commit()
            db.refresh(mission)

        await update_score(id, db)
        return {"success": True}


@router.post("/room/solved/")
async def room_refresh(room_id: int = Body(...), problem_id: int = Body(...), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    if datetime.now(korea_tz).replace(tzinfo=None) > room.end:
        raise HTTPException(status_code=400)

    async with httpx.AsyncClient() as client:
        room_players = (
            db.query(RoomPlayer, User)
            .join(User, RoomPlayer.user_id == User.id)
            .filter(RoomPlayer.room_id == room_id)
            .all()
        )

        users = [user for (user_room, user) in RoomPlayer]

        random.shuffle(users)
        for user in users:
            await update_solver(room_id, user, db, client)
        await update_score(room_id, db)


@router.post("/room/create")
async def room_create(db: Session = Depends(get_db),
                      handles: str = Body(...),
                      title: str = Body(...),
                      query: str = Body(...),
                      size: int = Body(...),
                      is_private: bool = Body(...),
                      end: int = Body(...)):
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
            name=title, finished_at=datetime.fromtimestamp(end), is_private=is_private
        )
        db.add(room)
        db.commit()
        db.refresh(room)

        for problem_id in problem_ids:
            mission = RoomMission(problem_id=problem_id, room_id = room.id)
            db.add(mission)
            db.commit()
            db.refresh(mission)
        
        for username in handles:
            user = db.query(User).filter(User.name ==username).first()
            if not user:
                user = User(name=username)
                db.add(user)
                db.commit()
                db.refresh(user)
            
            room_player = RoomPlayer(
                user_id=user.id,
                room_id=room.id,
            )
            db.add(RoomPlayer)
            db.commit()
        db.commit()

        return {"success": True, "roomId": room.id}
