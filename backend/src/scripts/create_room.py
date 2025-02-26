from sqlalchemy.orm import Session

from src.app.db.session import get_db


def create_room:
    db: Session = next(get_db())
