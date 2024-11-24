import random
from collections import deque
from datetime import datetime

import httpx
from fastapi import FastAPI, Form, Body, HTTPException, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from starlette.middleware.cors import CORSMiddleware

import models
from database import engine, SessionLocal
from models import Problem, User, ProblemRoom, UserRoom, Room
import pytz

MAX_USER_PER_ROOM = 20

korea_tz = pytz.timezone('Asia/Seoul')

try:
    models.Base.metadata.create_all(bind=engine)
except:
    pass

origins = [
    "http://localhost:5173",
    "https://blobnom.netlify.app",
    "http://blobnom.xyz",
    "https://blobnom.xyz",
]
app = FastAPI(docs_url=None, redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
async def room_info(db: Session = Depends(get_db)):
    rooms = (db.query(Room)
             .outerjoin(ProblemRoom)
             .group_by(Room.id)
             .order_by(func.greatest(
        Room.begin,
        func.coalesce(func.max(ProblemRoom.solved_at), Room.begin)
    ).desc())
             .options(joinedload(Room.user_associations).joinedload(UserRoom.user))
             .limit(120)
             .all())

    public_rooms = []
    private_rooms = []

    for room in rooms:
        room_data = {
            "id": room.id,
            "name": room.name,
            "size": room.size,
            "begin": room.begin,
            "end": room.end,
            "public": room.public,
            "users": len(room.users),

            "top_user": max(
                (
                    {"name": assoc.user.name, "score": assoc.score, "score2": assoc.score2}
                    for assoc in room.user_associations
                ),
                key=lambda x: (x["score"], x["score2"]),
                default={"name": None, "score": 0}
            )
        }

        if room.public:
            public_rooms.append(room_data)
        else:
            private_rooms.append(room_data)

    return {
        "publicroom": public_rooms,
        "privateroom": private_rooms
    }


@app.get("/room/info/{id}")
async def room_info(id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == id).options(
        joinedload(Room.user_associations).joinedload(UserRoom.user),
        joinedload(Room.problem_associations).joinedload(ProblemRoom.problem)
    ).first()
    return room


@app.post("/room/join/{id}")
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

        await calculate(id, db)
        return {"success": True}


async def calculate(roomId, db):
    room = db.query(Room).filter(Room.id == roomId).first()
    if not room:
        return
    n = 3 * room.size * (room.size + 1) + 1
    w = room.size * 2 + 1

    room_users = db.query(UserRoom).filter(
        UserRoom.room_id == roomId
    ).all()
    mp = [[-1 for _ in range(w)] for _ in range(w)]
    sol = [-1 for _ in range(n)]
    score2s = [0 for _ in range(MAX_USER_PER_ROOM)]
    for i in range(n):
        sol[i] = db.query(ProblemRoom) \
            .filter(ProblemRoom.room_id == roomId, ProblemRoom.index_in_room == i).first() \
            .solved_by

        if sol[i] is None:
            sol[i] = -1
        else:
            score2s[sol[i]] += 1

    ptr = 0
    for i in range(w):
        s = max(0, i - w // 2)
        for j in range(w - abs(i - w // 2)):
            mp[s + j][i] = ptr
            ptr += 1
    adj = [[] for _ in range(n)]
    for i in range(w):
        for j in range(w):
            if mp[i][j] < 0: continue
            if j + 1 < w and mp[i][j + 1] >= 0:
                adj[mp[i][j]].append(mp[i][j + 1])
                adj[mp[i][j + 1]].append(mp[i][j])
            if i + 1 < w and mp[i + 1][j] >= 0:
                adj[mp[i][j]].append(mp[i + 1][j])
                adj[mp[i + 1][j]].append(mp[i][j])
            if i + 1 < w and j + 1 < w and mp[i + 1][j + 1] >= 0:
                adj[mp[i][j]].append(mp[i + 1][j + 1])
                adj[mp[i + 1][j + 1]].append(mp[i][j])

    scores = [0 for _ in range(MAX_USER_PER_ROOM)]
    vis = [False for _ in range(n)]
    for i in range(n):
        if sol[i] < 0 or vis[i]: continue
        q = deque([])
        q.append(i)
        cur_sz = 0
        while q:
            u = q.popleft()
            if vis[u]:
                continue
            vis[u] = True
            cur_sz += 1
            for v in adj[u]:
                if sol[v] == sol[i]: q.append(v)
        scores[sol[i]] = max(scores[sol[i]], cur_sz)

    for user in room_users:
        user.score = scores[user.index_in_room]
        user.score2 = score2s[user.index_in_room]
        db.add(user)
    db.commit()


@app.post("/room/solved/")
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
        await calculate(roomId, db)


@app.post("/room/create")
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
