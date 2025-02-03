from datetime import datetime
from typing import List, Optional, Dict

from pydantic import BaseModel

from src.app.core.enums import ModeType, ContestType


class RoomCreateRequest(BaseModel):
    owner_handle: str
    handles: Dict[str, int]
    title: str
    query: str
    size: int
    mode: ModeType
    is_private: bool
    max_players: int
    edit_password: str
    entry_pin: str
    unfreeze_offset_minutes: Optional[int]
    starts_at: datetime
    ends_at: datetime


class ContestCreateRequest(BaseModel):
    name: str
    query: str
    type: ContestType
    missions_per_room: int
    players_per_room: int
    starts_at: datetime
    ends_at: datetime


class RegisterRequest(BaseModel):
    handle: str
    email: str
    password: str


class LoginRequest(BaseModel):
    handle: str
    password: str
    remember_me: bool


class RoomDeleteRequest(BaseModel):
    password: str


class UserSummary(BaseModel):
    handle: str
    role: Optional[str] = None  # 비회원일 경우 None
    rating: Optional[int] = None
    guild_mark: Optional[str] = None


class RoomTeamInfo(BaseModel):
    users: List[Dict]
    team_index: int
    adjacent_solved_count: Optional[int]
    total_solved_count: Optional[int]
    last_solved_at: Optional[datetime]

    class Config:
        from_attributes = True


class RoomMissionInfo(BaseModel):
    problem_id: int
    index_in_room: int
    solved_at: Optional[datetime]
    solved_player_index: Optional[int]
    solved_team_index: Optional[int]
    solved_user_name: Optional[str]
    difficulty: Optional[int]

    class Config:
        from_attributes = True


class ContestSummary(BaseModel):
    id: int
    name: str
    query: str
    starts_at: datetime
    ends_at: datetime
    num_participants: int
    players_per_room: int
    missions_per_room: int


class RoomSummary(BaseModel):
    id: int
    name: str
    starts_at: datetime
    ends_at: datetime
    owner: Optional[UserSummary] = None
    num_players: int
    max_players: int
    num_missions: int
    num_solved_missions: int
    winner: str
    is_private: bool
    is_contest_room: bool

    class Config:
        from_attributes = True


class RoomDetail(BaseModel):
    starts_at: Optional[datetime]
    ends_at: Optional[datetime]
    id: int
    name: str
    owner: str
    is_private: bool
    is_user_in_room: bool
    is_owner_a_member: bool  # True면 비회원에게 삭제 버튼이 보이지 않음
    num_missions: int
    is_started: bool
    mode_type: ModeType
    team_info: List[RoomTeamInfo]
    mission_info: List[RoomMissionInfo]
    is_contest_room: bool

    class Config:
        from_attributes = True


class ContestDetails(BaseModel):
    id: int
    name: str
    query: str
    starts_at: datetime
    ends_at: datetime
    num_participants: int
    participants: List[str]
    players_per_room: int
    missions_per_room: int
    is_user_registered: bool
    is_started: bool
    is_ended: bool
    is_rated: bool
    user_room_id: Optional[int]
    room_details: Dict[int, RoomDetail]


class ContestHistory(BaseModel):
    rating_before: Optional[int]
    rating_after: Optional[int]
    contest_id: int
    contest_name: str
    final_rank: Optional[int]
    is_rated: bool
    started_at: datetime
    performance: Optional[int]


class MemberDetails(BaseModel):
    handle: str
    desc: str
    rating: int
    contest_history: List[ContestHistory]
    num_solved_missions: int
