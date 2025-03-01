from sqlalchemy.orm import Session

from src.app.db.models.models import User, RoomMission
from src.app.db.session import get_db


def count_solved_missions_of_users_script():
    db: Session = next(get_db())
    users = db.query(User).all()
    for user in users:
        c = db.query(RoomMission).filter(RoomMission.solved_user_id == user.id).count()
        user.num_solved_missions = c
        db.add(user)
    db.commit()


if __name__ == "__main__":
    count_solved_missions_of_users_script()
