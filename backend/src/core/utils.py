from collections import deque
from datetime import datetime

from src.core.constants import MAX_USER_PER_ROOM, korea_tz
from src.core.models import Problem, UserRoom, Room

async def update_score(roomId, db):
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


async def get_solved_problem_list(room_id, username, db, client):
    problems = db.query(Problem).filter(Problem.room_id == room_id).all()
    problem_ids = [problem.problem_id for problem in problems if problem.solved_at is None]
    paged_problem_ids = [problem_ids[i:i + 50] for i in range(0, len(problem_ids), 50)]

    solved_problem_list = []

    for problem_ids_page in paged_problem_ids:
        query = ""
        for problem_id in problem_ids_page:
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


async def update_solver(room_id, user, db, client):
    solved_problem_list = get_solved_problem_list(room_id, user.name, db, client)

    problems = db.query(Problem).filter(
        Problem.id.in_(solved_problem_list),
        Problem.room_id == room_id
    ).all()

    for problem in problems:
        problem.solved_at = datetime.now(korea_tz)
        problem.solved_by = user.id

        db.commit()
        db.refresh(problem)
    return
