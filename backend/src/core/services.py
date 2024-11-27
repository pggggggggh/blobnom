from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from src.core.models import Problem, User, UserRoom, Room
from src.core.schemas import RoomDetail, RoomSummary
from src.core.schemas import UserRoomInfo, ProblemRoomInfo, RoomDetail

def get_room_summary(room: Room) -> RoomSummary:
    return RoomSummary(
        id = room.id,
        name = room.name,
        begin = room.started_at,
        end = room.finished_at,
        public = not room.is_private,
        users = len(room.users),
        top_user = room.winner_user
    )

def get_room_detail(room_id: int, db: Session) -> RoomDetail:
    room = db.query(Room).filter(Room.id == id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    user_rooms = (
        db.query(UserRoom, User)
        .join(User, UserRoom.user_id == User.id)
        .filter(UserRoom.room_id == id)
        .all()
    )

    user_room_info = [
        UserRoomInfo(
            user_id=user.id,
            name=user.name,
            user_index=user_room.user_index,
            adjacent_solved_count=user_room.adjacent_solved_count,
            total_solved_count=user_room.total_solved_count,
            last_solved_at=user_room.last_solved_at
        )
        for user_room, user in user_rooms
    ]

    problems = db.query(Problem).filter(Problem.room_id == id).all()
    problem_room_info = [
        ProblemRoomInfo(
            problem_id=problem.problem_id,
            solved_at=problem.solved_at,
            solved_user_id=problem.solved_user_id
        )
        for problem in problems
    ]

    room_detail = RoomDetail(
        begin=room.started_at,
        end=room.finished_at,
        id=room.id,
        name=room.name,
        is_private=room.is_private,
        user_room_info=user_room_info,
        problem_room_info=problem_room_info
    )

    return room_detail
