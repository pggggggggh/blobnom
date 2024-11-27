import random
from datetime import datetime

import httpx
from fastapi import Body, HTTPException, Depends, APIRouter, status
from sqlalchemy import func, desc
from sqlalchemy.orm import Session, joinedload

from src.database import get_db
from src.core.constants import MAX_USER_PER_ROOM, korea_tz
from src.core.models import Problem, User, UserRoom, Room
from src.core.utils import update_score, update_solver, get_solved_problem_list
from src.core.services import get_room_summary, get_room_detail

router = APIRouter()

@router.get("/")
async def room_list(db: Session = Depends(get_db)):
    rooms = (
        db.query(Room)
        .join(Room.user_rooms)
        .join(UserRoom.user)
        .options(joinedload(Room.user_rooms).joinedload(UserRoom.user))
        .order_by(desc(Room.updated_at))
        .all()
    )

    public_rooms = []
    private_rooms = []

    for room in rooms:
        room_data = get_room_summary(room)

        if room.is_private:
            private_rooms.append(room_data)
        else:
            public_rooms.append(room_data)

    return {
        "publicRoom": public_rooms,
        "privateRoom": private_rooms
    }


@router.get("/room/info/{id}")
async def room_detail(id: int, db: Session = Depends(get_db)):
    return get_room_detail(room_id=id, db=db)


@router.post("/room/join/{id}")
async def room_join(id: int, handle: str = Body(...), db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        room = db.query(Room).filter(Room.id == id).first()
        if not room:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

        user_rooms = (
            db.query(UserRoom, User)
            .join(User, UserRoom.user_id == User.id)
            .filter(UserRoom.room_id == id)
            .all()
        )

        if len(user_rooms) >= MAX_USER_PER_ROOM:
            raise HTTPException(status_code=400, detail="인원이 가득 찼습니다.")

        if any(user.name == handle for (user_room, user) in user_rooms):
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
        
        solved_problem_list = get_solved_problem_list(id, handle, db, client)

        if len(solved_problem_list) > 2:
            raise HTTPException(status_code=400, detail="이미 해결한 문제가 2문제를 초과하여 참여할 수 없습니다.")

        user_room = UserRoom(
            user_id=user.id,
            room_id=id,
        )
        db.add(user_room)
        db.commit()

        problems = db.query(Problem).filter(
            Problem.id.in_(solved_problem_list),
            Problem.room_id == id
        ).all()

        for problem in problems:
            problem.solved_at = room.begin
            problem.solved_by = user.id

            db.commit()
            db.refresh(problem)

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
        user_rooms = (
            db.query(UserRoom, User)
            .join(User, UserRoom.user_id == User.id)
            .filter(UserRoom.room_id == room_id)
            .all()
        )

        users = [user for (user_room, user) in user_rooms]

        random.shuffle(users)
        for user in users:
            update_solver(room_id, user, db, client)
        await update_score(room_id, db)


@router.post("/room/create")
async def room_create(db: Session = Depends(get_db),
                      handles: str = Body(...),
                      title: str = Body(...),
                      query: str = Body(...),
                      size: int = Body(...),
                      public: bool = Body(...),
                      end: int = Body(...)):
    async with httpx.AsyncClient() as client:
        handles = handles.split()

        items = []
        ids = []
        for page in range(1, 7):
            response = await client.get("https://solved.ac/api/v3/search/problem",
                                        params={"query": query, "sort": "random", "page": 1})
            tmp = response.json()["items"]
            for item in tmp:
                if item["problemId"] not in ids:
                    items.append(item)
                    ids.append(item["problemId"])
        n = 3 * size * (size + 1) + 1
        if len(items) < n:
            raise HTTPException(status_code=400, detail="Bad query")
        items = items[:n]
        ids = [item["problemId"] for item in items]
        room = Room(
            name=title, begin=datetime.now(korea_tz), end=datetime.fromtimestamp(end), size=size, public=public
        )
        db.add(room)
        db.commit()
        db.refresh(room)

        for i in range(n):
            if not db.query(Problem).filter(Problem.id == ids[i]).first():
                problem = Problem(id=ids[i])
                db.add(problem)
                db.commit()
                db.refresh(problem)
            else:
                problem = db.query(Problem).filter(Problem.id == ids[i]).first()
            problem_room = ProblemRoom(
                problem_id=problem.id,
                room_id=room.id,
                index_in_room=i
            )
            db.add(problem_room)
            db.commit()
        db.commit()

        for i in range(len(handles)):
            if not db.query(User).filter(User.name == handles[i]).first():
                user = User(name=handles[i])
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                user = db.query(User).filter(User.name == handles[i]).first()
            user_room = UserRoom(
                user_id=user.id,
                room_id=room.id,
                index_in_room=i,
                score=0,
            )
            db.add(user_room)
            db.commit()
        db.commit()

        return {"success": True, "roomId": room.id}
