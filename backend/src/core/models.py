from sqlalchemy import Integer, Column, String, ForeignKey, DateTime, BigInteger, Boolean
from sqlalchemy.orm import Relationship, relationship

from src.core.config import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    size = Column(Integer)
    name = Column(String, index=True)
    begin = Column(DateTime)
    end = Column(DateTime)
    public = Column(Boolean)
    user_associations = relationship("UserRoom", back_populates="room")
    problem_associations = relationship("ProblemRoom", back_populates="room")
    users = relationship("User", secondary="user_room", back_populates="rooms")
    problems = relationship("Problem", secondary="problem_room", back_populates="rooms")


class UserRoom(Base):
    __tablename__ = "user_room"

    user_id = Column(ForeignKey("users.id"), primary_key=True)
    room_id = Column(ForeignKey("rooms.id"), primary_key=True)
    index_in_room = Column(Integer, nullable=False)
    score = Column(Integer)
    score2 = Column(Integer)

    user = relationship("User", back_populates="room_associations")
    room = relationship("Room", back_populates="user_associations")


class ProblemRoom(Base):
    __tablename__ = "problem_room"

    problem_id = Column(ForeignKey("problems.id"), primary_key=True)
    room_id = Column(ForeignKey("rooms.id"), primary_key=True)
    solved_at = Column(DateTime)
    solved_by = Column(Integer)
    index_in_room = Column(Integer, nullable=False)

    problem = relationship("Problem", back_populates="room_associations")
    room = relationship("Room", back_populates="problem_associations")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    room_associations = relationship("UserRoom", back_populates="user")
    rooms = relationship("Room", secondary="user_room", back_populates="users")


class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    room_associations = relationship("ProblemRoom", back_populates="problem")
    rooms = relationship("Room", secondary="problem_room", back_populates="problems")
