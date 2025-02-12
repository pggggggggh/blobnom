import time

import requests
from sqlalchemy.orm import Session

from src.app.db.database import get_db
from src.app.db.models.models import RoomMission, Room, User


def get_mission_difficulty(problem_ids):
    url = f"https://solved.ac/api/v3/problem/lookup?problemIds={','.join(problem_ids)}"
    time.sleep(0.5)

    result = {}
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        for problem in data:
            result[problem["problemId"]] = problem["level"]
    except requests.RequestException as e:
        print(e)
        return 0

    return result


def update_difficulty(batch_size=50):
    db: Session = next(get_db())
    missions = db.query(RoomMission).filter(RoomMission.difficulty == 0).all()
    for start in range(0, len(missions), batch_size):
        print(f"{start}/{len(missions)}")
        batch = missions[start:start + batch_size]
        problemIds = []
        for problem in batch:
            problemIds.append(str(problem.problem_id))
        difficulties = get_mission_difficulty(problemIds)
        for problem in batch:
            if problem.problem_id in difficulties:  # 삭제된 문항의 경우 없을 수도 있음
                problem.difficulty = difficulties[problem.problem_id]
                db.add(problem)
        db.commit()
