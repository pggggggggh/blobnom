import math
from collections import deque
from datetime import datetime

from src.core.constants import MAX_USER_PER_ROOM, korea_tz
from src.core.models import User, Problem, UserRoom, Room

async def update_score(room_id, db):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        return

    user_rooms = (
        db.query(UserRoom, User)
        .join(User, UserRoom.user_id == User.id)
        .filter(UserRoom.room_id == room_id)
        .all()
    )
    problems = db.query(Problem).filter(Problem.room_id == room_id).all()

    num_problem = len(problems)
    board_width = 2 * math.sqrt(num_problem / 3) + 3

    board = [[-1 for _ in range(board_width)] for _ in range(board_width)]
    solved_user_index = [-1 for _ in range(num_problem)]

    adjacent_solved_count_list = [0 for _ in range(MAX_USER_PER_ROOM)]
    total_solved_count_list = [0 for _ in range(MAX_USER_PER_ROOM)]
    last_solved_at_list = [room.created_at for _ in range(MAX_USER_PER_ROOM)]

    user_id2index = {user.id: index for index, (userroom, user) in enumerate(user_rooms)}

    for index, problem in enumerate(problems):
        solved_user_id = problem.solved_user_id
        if solved_user_id is not None:
            solved_user_index = user_id2index[solved_user_id]

            solved_user_index[index] = solved_user_index
            total_solved_count_list[solved_user_index] += 1
            if problem.solved_at > last_solved_at_list[solved_user_index]:
                last_solved_at_list[solved_user_index] = problem.solved_at

    ptr = 0
    for i in range(board_width):
        s = max(0, i - board_width // 2)
        for j in range(board_width - abs(i - board_width // 2)):
            board[s + j][i] = ptr
            ptr += 1
    graph = [[] for _ in range(num_problem)]
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
    
    vis = [False for _ in range(num_problem)]
    for i in range(num_problem):
        if solved_user_index[i] < 0 or vis[i]: continue
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
                if solved_user_index[v] == solved_user_index[i]: q.append(v)
        adjacent_solved_count_list[solved_user_index[i]] = max(
            adjacent_solved_count_list[solved_user_index[i]],
            adjacent_count
        )

    for (userroom, user) in user_rooms:
        user_index = user_id2index[user.id]
        user.adjacent_solved_count = adjacent_solved_count_list[user_index]
        user.total_solved_count = total_solved_count_list[user_index]
        user.last_solved_at = last_solved_at_list[user_index]
        db.add(user)
    db.commit()

    users = [user for (userroom, user) in user_rooms]    
    sorted_users = sorted(
        users,
        key=lambda user: (
            -user.adjacent_solved_count,   # 내림차순
            -user.total_solved_count,      # 내림차순
            user.last_solved_at            # 오름차순
        )
    )

    room.winning_user_id = sorted_users[0].id
    db.commit()
    db.refresh(room)
    return


async def get_solved_problem_list(room_id, username, db, client):
    problems = db.query(Problem).filter(Problem.room_id == room_id).all()
    problem_ids = [problem.problem_id for problem in problems if problem.solved_at is None]
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
