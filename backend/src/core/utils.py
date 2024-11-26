from collections import deque

from src.core.constants import MAX_USER_PER_ROOM
from src.core.models import ProblemRoom, UserRoom, Room


async def update_solver(roomId, db):
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
