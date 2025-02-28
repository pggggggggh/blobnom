from sqlalchemy import Integer, Column, String, ForeignKey, DateTime, Boolean, Enum, ARRAY
from sqlalchemy.orm import relationship, Relationship

from src.app.core.constants import MAX_TEAM_PER_ROOM
from src.app.core.enums import Platform, ModeType, ContestType, Role, PenaltyType, BoardType
from src.app.db.database import Base, TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    handle = Column("name", String, index=True)

    member_id = Column(ForeignKey("members.id"), nullable=True)

    member = relationship("Member")
    user_rooms = relationship("RoomPlayer", back_populates="user")
    solved_missions = relationship("RoomMission", back_populates="solved_user")
    platform = Column(Enum(Platform), nullable=False, default=Platform.BOJ)


class Member(TimestampMixin, Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True)
    handle = Column(String, index=True)
    role = Column(Enum(Role), nullable=False, default=Role.MEMBER)
    email = Column(String)
    password = Column(String, nullable=False)

    rating = Column(Integer, default=1200)

    users = relationship("User", back_populates="member")
    owned_rooms = relationship("Room", back_populates="owner", foreign_keys="[Room.owner_id]")
    registered_contests = relationship("ContestMember", back_populates="member")
    practice_sets = relationship("PracticeMember", back_populates="member")


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

    owner_id = Column(ForeignKey("members.id"), nullable=True)
    owner = relationship("Member", foreign_keys=[owner_id], back_populates="owned_rooms")

    unfreeze_offset_minutes = Column(Integer, nullable=True)
    mode_type = Column(Enum(ModeType), nullable=False, default=ModeType.LAND_GRAB_SOLO)
    board_type = Column(Enum(BoardType), nullable=False, default=BoardType.HEXAGON)
    platform = Column(Enum(Platform), nullable=False)
    winning_team_index = Column(Integer, default=0)

    winner = Column(String, nullable=False, default="")
    num_solved_missions = Column(Integer, nullable=False, default=0)
    last_solved_at = Column(DateTime(timezone=True))

    players = relationship("RoomPlayer", back_populates="room", foreign_keys="RoomPlayer.room_id")
    missions = relationship("RoomMission", back_populates="room")

    practice_session = relationship("PracticeMember", back_populates="room",
                                    uselist=False)

    is_contest_room = Column(Boolean, nullable=False, default=False)


class RoomMission(TimestampMixin, Base):
    __tablename__ = "room_missions"

    id = Column(Integer, primary_key=True)
    index_in_room = Column(Integer, nullable=False)

    platform = Column(Enum(Platform), nullable=False, default=Platform.BOJ)
    problem_id = Column(String)
    difficulty = Column(Integer, default=0)

    room_id = Column(ForeignKey("rooms.id"))
    room = relationship("Room", back_populates="missions")

    solved_at = Column(DateTime(timezone=True))
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
    rank = Column(Integer)  # 추후 적용 예정

    user_id = Column(ForeignKey("users.id"))
    user = relationship("User", back_populates="user_rooms")

    room_id = Column(ForeignKey("rooms.id"))
    room = relationship("Room", back_populates="players", foreign_keys=[room_id])

    unsolvable_mission_ids = Column(ARRAY(Integer), default=[])
    next_solvable_mission_ids = Column(ARRAY(Integer), nullable=True, default=[])

    solved_missions = relationship("RoomMission", back_populates="solved_room_player")


class SolvedacToken(TimestampMixin, Base):
    __tablename__ = "solvedac_tokens"

    id = Column(Integer, primary_key=True)
    token = Column(String)
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)


class Contest(TimestampMixin, Base):
    __tablename__ = "contests"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True, nullable=False)
    desc = Column(String, nullable=True)
    is_deleted = Column(Boolean, default=False)

    query = Column(String)
    type = Column(Enum(ContestType), nullable=False, default=ContestType.CONTEST_BOJ_GENERAL)

    is_rated = Column(Boolean, default=False)
    min_rating = Column(Integer, nullable=True)
    max_rating = Column(Integer, nullable=True)

    missions_per_room = Column(Integer, nullable=False)
    players_per_room = Column(Integer, nullable=False)

    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=False)

    is_started = Column(Boolean, nullable=False, default=False)
    is_ended = Column(Boolean, nullable=False, default=False)

    contest_rooms = relationship("ContestRoom", back_populates="contest", foreign_keys="ContestRoom.contest_id")
    contest_members = relationship("ContestMember", back_populates="contest")


class ContestRoom(TimestampMixin, Base):
    __tablename__ = "contest_rooms"

    id = Column(Integer, primary_key=True)
    index = Column(Integer, nullable=False)  # in which room number within the contest

    contest_id = Column(ForeignKey("contests.id"))
    contest = relationship("Contest", back_populates="contest_rooms")

    room_id = Column(ForeignKey("rooms.id"))
    room = relationship("Room")


class ContestMember(TimestampMixin, Base):
    __tablename__ = "contest_members"
    id = Column(Integer, primary_key=True)

    contest_id = Column(ForeignKey("contests.id"))
    contest = relationship("Contest", back_populates="contest_members")

    member_id = Column(ForeignKey("members.id"))
    member = relationship("Member", back_populates="registered_contests")

    room_id = Column(ForeignKey("rooms.id"))
    room = relationship("Room")

    final_rank = Column(Integer)
    performance = Column(Integer)
    rating_before = Column(Integer)
    rating_after = Column(Integer)


class PracticeSet(TimestampMixin, Base):
    __tablename__ = "practice_sets"
    id = Column(Integer, primary_key=True)

    name = Column(String, nullable=False)
    desc = Column(String, nullable=True)
    difficulty = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=False)  # minutes
    platform = Column(Enum(Platform), nullable=False, default=Platform.BOJ)
    penalty_type = Column(Enum(PenaltyType), nullable=False, default=PenaltyType.ICPC)
    problem_ids = Column(ARRAY(Integer), nullable=False, default=lambda: [])

    practice_members = relationship("PracticeMember", back_populates="practice_set")

    created_member_id = Column(ForeignKey("members.id"))
    created_by = relationship("Member", foreign_keys=[created_member_id])


class PracticeMember(TimestampMixin, Base):
    __tablename__ = "practice_members"
    id = Column(Integer, primary_key=True)

    practice_set_id = Column(ForeignKey("practice_sets.id"))
    practice_set = relationship("PracticeSet", foreign_keys=[practice_set_id], back_populates="practice_members")
    member_id = Column(ForeignKey("members.id"))
    member = relationship("Member", foreign_keys=[member_id], back_populates="practice_sets")
    room_id = Column(ForeignKey("rooms.id"))
    room = relationship("Room", foreign_keys=[room_id], back_populates="practice_session", uselist=False)

    score = Column(Integer, default=0)
    penalty = Column(Integer, default=0)
    rank = Column(Integer)
