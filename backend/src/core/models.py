from sqlalchemy import Integer, Column, String, ForeignKey, DateTime, BigInteger, Boolean, Enum
from sqlalchemy.orm import relationship, Relationship

from src.core.enums import ProblemType
from src.database import Base, TimestampMixin

class User(TimestampMixin, Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)

    user_rooms = relationship("RoomPlayer", back_populates="user")
    solved_missions = relationship("RoomMission", back_populates="solved_user")


class Room(TimestampMixin, Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    password = Column(String)
    started_at = Column(DateTime)
    finished_at = Column(DateTime)
    is_private = Column(Boolean)

    winning_user_id = Column(ForeignKey("users.id"))
    winning_user = relationship("User", foreign_keys=[winning_user_id])

    winning_player_id = Column(ForeignKey("room_players.id"))
    winning_player = relationship("RoomPlayer", foreign_keys=[winning_player_id])

    players = relationship("RoomPlayer", back_populates="room", foreign_keys="RoomPlayer.room_id")
    missions = relationship("RoomMission", back_populates="room")


class RoomMission(TimestampMixin, Base):
    __tablename__ = "room_missions"

    id = Column(Integer, primary_key=True)

    problem_type = Column(Enum(ProblemType), nullable=False, default=ProblemType.BOJ)
    problem_id = Column(Integer)
    solved_at = Column(DateTime)

    room_id = Column(ForeignKey("rooms.id"))
    room = relationship("Room", back_populates="missions")

    solved_room_player_id = Column(ForeignKey("room_players.id"))
    solved_room_player = relationship("RoomPlayer",back_populates="solved_missions")
    solved_user_id = Column(ForeignKey("users.id"),nullable=True)
    solved_user = relationship("User", back_populates="solved_missions")


class RoomPlayer(TimestampMixin, Base):
    __tablename__ = "room_players"

    id = Column(Integer, primary_key=True)
    player_index = Column(Integer, nullable=False)
    team_index = Column(Integer)
    adjacent_solved_count = Column(Integer,nullable=False,default=0)
    total_solved_count = Column(Integer,nullable=False,default=0)
    last_solved_at = Column(DateTime)

    user_id = Column(ForeignKey("users.id"))
    user = relationship("User", back_populates="user_rooms")

    room_id = Column(ForeignKey("rooms.id"))
    room = relationship("Room", back_populates="players", foreign_keys=[room_id])

    solved_missions = relationship("RoomMission",back_populates="solved_room_player")

