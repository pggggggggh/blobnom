import random
from datetime import datetime

import httpx
from fastapi import Body, HTTPException, Depends, APIRouter
from sqlalchemy import func, desc
from sqlalchemy.orm import Session, joinedload

from src.database import get_db
from src.core.constants import MAX_USER_PER_ROOM, korea_tz
from src.core.models import Problem, User, ProblemRoom, UserRoom, Room
from src.core.utils import update_solver
from src.core.services import create_room_summary

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
        room_data = create_room_summary(room)

        if room.is_private:
            private_rooms.append(room_data)
        else:
            public_rooms.append(room_data)

    return {
        "publicroom": public_rooms,
        "privateroom": private_rooms
    }


@router.get("/room/info/{id}")
async def room_detail(id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == id).options(
        joinedload(Room.user_associations).joinedload(UserRoom.user),
        joinedload(Room.problem_associations).joinedload(ProblemRoom.problem)
    ).first()
    return room


@router.post("/room/join/{id}")
async def room_join(id: int, handle: str = Body(...), db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        users = db.query(UserRoom).filter(UserRoom.room_id == id).all()
        if len(users) >= MAX_USER_PER_ROOM:
            raise HTTPException(status_code=400, detail="인원이 가득 찼습니다.")

        if not db.query(User).filter(User.name == handle).first():
            user = User(name=handle)
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            user = db.query(User).filter(User.name == handle).first()
            if db.query(UserRoom).filter(UserRoom.room_id == id, UserRoom.user_id == user.id).first():
                raise HTTPException(status_code=400, detail="이미 존재하는 유저입니다.")

        query = "@" + handle
        response = await client.get("https://solved.ac/api/v3/search/problem",
                                    params={"query": query})
        if len(response.json()["items"]) == 0:
            raise HTTPException(status_code=400, detail="유효하지 않은 핸들입니다.")

        vis = [0 for _ in range(100)]
        for u in users:
            vis[u.index_in_room] = 1

        idx = -1
        for i in range(100):
            if not vis[i]:
                idx = i
                break

        if idx == -1:
            raise HTTPException(status_code=400)

        room = db.query(Room).filter(Room.id == id).first()
        problemIds = [problem.id for problem in room.problems]

        already_solved = []

        for problemId in problemIds:
            query = str(problemId) + " @" + handle
            response = await client.get("https://solved.ac/api/v3/search/problem",
                                        params={"query": query})
            items = response.json()["items"]
            for item in items:
                already_solved.append(item["problemId"])

        if len(already_solved) > 2:
            raise HTTPException(status_code=400, detail="이미 해결한 문제가 2문제를 초과하여 참여할 수 없습니다.")

        user_room = UserRoom(
            user_id=user.id,
            room_id=id,
            index_in_room=idx,
            score=0,
        )
        db.add(user_room)
        db.commit()

        for problemId in already_solved:
            problem_room = db.query(ProblemRoom).filter(
                ProblemRoom.problem_id == problemId,
                ProblemRoom.room_id == id
            ).first()
            if problem_room is not None and problem_room.solved_at is None:
                problem_room.solved_at = room.begin
                problem_room.solved_by = user_room.index_in_room
                db.add(user_room)
                db.add(problem_room)
                db.commit()
                db.refresh(problem_room)

        await update_solver(id, db)
        return {"success": True}


@router.post("/room/solved/")
async def room_refresh(roomId: int = Body(...), problemId: int = Body(...), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == roomId).first()
    if not room:
        raise HTTPException(status_code=400)
    if datetime.now(korea_tz).replace(tzinfo=None) > room.end:
        raise HTTPException(status_code=400)
    users = room.users

    async with httpx.AsyncClient() as client:
        random.shuffle(users)
        for user in users:
            username = user.name
            query = str(problemId) + " @" + username
            response = await client.get("https://solved.ac/api/v3/search/problem",
                                        params={"query": query})
            items = response.json()["items"]
            for item in items:
                print(item["problemId"])
                problem_room = db.query(ProblemRoom).filter(
                    ProblemRoom.problem_id == item["problemId"],
                    ProblemRoom.room_id == roomId
                ).first()
                if problem_room is not None and problem_room.solved_at is None:
                    user_room = db.query(UserRoom).filter(
                        UserRoom.user_id == user.id,
                        UserRoom.room_id == roomId
                    ).first()
                    problem_room.solved_at = datetime.now(korea_tz)
                    problem_room.solved_by = user_room.index_in_room
                    db.add(problem_room)
                    db.commit()
                    db.refresh(problem_room)
        await update_solver(roomId, db)


@router.post("/room/create")
async def create_room(db: Session = Depends(get_db),
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
