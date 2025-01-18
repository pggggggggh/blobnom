from sqlalchemy import Integer, Column, String, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship

from src.app.core.constants import MAX_TEAM_PER_ROOM
from src.app.core.enums import ProblemType, ModeType
from src.app.db.database import Base, TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    handle = Column("name", String, index=True)

    member_id = Column(ForeignKey("members.id"), nullable=True)

    member = relationship("Member")
    owned_rooms = relationship("Room", back_populates="owner", foreign_keys="[Room.owner_id]")
    user_rooms = relationship("RoomPlayer", back_populates="user")
    solved_missions = relationship("RoomMission", back_populates="solved_user")


class Member(TimestampMixin, Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True)
    handle = Column(String, index=True)
    email = Column(String)
    password = Column(String, nullable=False)


class Room(TimestampMixin, Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    query = Column(String)
    num_mission = Column(Integer)  # needed to show roomsummary for rooms before start

    edit_pwd = Column(String)
    entry_pwd = Column(String)
    is_deleted = Column(Boolean, default=False)

    starts_at = Column(DateTime(timezone=True))
    ends_at = Column(DateTime(timezone=True))
    is_started = Column(Boolean, nullable=False)

    max_players = Column(Integer, default=MAX_TEAM_PER_ROOM)
    is_private = Column(Boolean)

    owner_id = Column(ForeignKey("users.id"), nullable=True)
    owner = relationship("User", foreign_keys=[owner_id], back_populates="owned_rooms")

    mode_type = Column(Enum(ModeType), nullable=False, default=ModeType.LAND_GRAB_SOLO)
    winning_team_index = Column(Integer, default=1)

    players = relationship("RoomPlayer", back_populates="room", foreign_keys="RoomPlayer.room_id")
    missions = relationship("RoomMission", back_populates="room")


class RoomMission(TimestampMixin, Base):
    __tablename__ = "room_missions"

    id = Column(Integer, primary_key=True)
    index_in_room = Column(Integer, nullable=False)

    problem_type = Column(Enum(ProblemType), nullable=False, default=ProblemType.BOJ)
    problem_id = Column(Integer)
    solved_at = Column(DateTime(timezone=True))

    room_id = Column(ForeignKey("rooms.id"))
    room = relationship("Room", back_populates="missions")

    solved_room_player_id = Column(ForeignKey("room_players.id"))
    solved_room_player = relationship("RoomPlayer", back_populates="solved_missions")
    solved_team_index = Column(Integer)
    solved_user_id = Column(ForeignKey("users.id"), nullable=True)
    solved_user = relationship("User", back_populates="solved_missions")


class RoomPlayer(TimestampMixin, Base):
    __tablename__ = "room_players"

    id = Column(Integer, primary_key=True)
    player_index = Column(Integer, nullable=False)
    team_index = Column(Integer)

    adjacent_solved_count = Column(Integer, nullable=False, default=0)
    total_solved_count = Column(Integer, nullable=False, default=0)
    indiv_solved_count = Column(Integer, nullable=False, default=0)  # 개인은 푼 문제수만 셈

    last_solved_at = Column(DateTime(timezone=True))

    user_id = Column(ForeignKey("users.id"))
    user = relationship("User", back_populates="user_rooms")

    room_id = Column(ForeignKey("rooms.id"))
    room = relationship("Room", back_populates="players", foreign_keys=[room_id])

    solved_missions = relationship("RoomMission", back_populates="solved_room_player")


class SolvedacToken(TimestampMixin, Base):
    __tablename__ = "solvedac_tokens"

    id = Column(Integer, primary_key=True)
    token = Column(String)
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
