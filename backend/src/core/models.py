from sqlalchemy import Integer, Column, String, ForeignKey, DateTime, BigInteger, Boolean
from sqlalchemy.orm import relationship

from src.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    user_rooms = relationship("UserRoom", back_populates="user")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    password = Column(String)
    started_at = Column(DateTime)
    updated_at = Column(DateTime)
    finished_at = Column(DateTime)
    is_private = Column(Boolean)
    winner_user_id = Column(ForeignKey("users.id"))
    user_rooms = relationship("UserRoom", back_populates="room")


class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, primary_key=True)
    room_id = Column(ForeignKey("rooms.id"), primary_key=True)
    solved_at = Column(DateTime)
    solved_user_id = Column(ForeignKey("users.id"))


class UserRoom(Base):
    __tablename__ = "user_room"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id"), primary_key=True)
    room_id = Column(ForeignKey("rooms.id"), primary_key=True)
    user_index = Column(Integer, nullable=False)
    adjacent_solved_count = Column(Integer)
    total_solved_count = Column(Integer)
    last_solved_at = Column(DateTime)
