from datetime import datetime
from typing import List, Optional, Dict

from pydantic import BaseModel
from sqlalchemy import DateTime

from src.app.core.enums import ModeType, ContestType, Platform, BoardType


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
    platform: Platform
    entry_pin: str
    unfreeze_offset_minutes: Optional[int]
    starts_at: datetime
    ends_at: datetime


class ContestCreateRequest(BaseModel):
    name: str
    desc: Optional[str]
    query: str
    type: ContestType
    missions_per_room: int
    players_per_room: int
    starts_at: datetime
    ends_at: datetime
    is_rated: bool
    min_rating: Optional[int]
    max_rating: Optional[int]


class RegisterRequest(BaseModel):
    platform: Platform
    handle: str
    email: str
    password: str


class LoginRequest(BaseModel):
    handle: str
    password: str
    remember_me: bool


class BindRequest(BaseModel):
    handle: str
    platform: Platform


class PracticeStartRequest(BaseModel):
    start_time: datetime


class RoomDeleteRequest(BaseModel):
    password: str


class RoomJoinRequest(BaseModel):
    password: str


class RoomListRequest(BaseModel):
    page: Optional[int]
    search: Optional[str] = ""
    activeOnly: Optional[bool] = False
    myRoomOnly: Optional[bool] = False


class UserSummary(BaseModel):
    handle: str
    role: Optional[str] = None  # 비회원일 경우 None
    rating: Optional[int] = None
    guild_mark: Optional[str] = None
    accounts: Optional[Dict[str, str]] = None


class RoomTeamInfo(BaseModel):
    users: List[Dict]
    team_index: int
    adjacent_solved_count: Optional[int]
    total_solved_count: Optional[int]
    last_solved_at: Optional[datetime]

    class Config:
        from_attributes = True


class RoomMissionInfo(BaseModel):
    id: int
    problem_id: str
    platform: Platform
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
    desc: Optional[str]
    query: str
    starts_at: datetime
    ends_at: datetime
    num_participants: int
    players_per_room: int
    missions_per_room: int
    min_rating: Optional[int]
    max_rating: Optional[int]


class RoomSummary(BaseModel):
    id: int
    name: str
    platform: Platform
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
    platform: Platform
    query: Optional[str] = None
    owner: str
    is_private: bool
    is_user_in_room: bool
    is_owner_a_member: bool  # True면 비회원에게 삭제 버튼이 보이지 않음
    num_missions: int
    is_started: bool
    mode_type: ModeType
    board_type: BoardType
    team_info: List[RoomTeamInfo]
    mission_info: List[RoomMissionInfo]
    your_unsolvable_mission_ids: List[int]

    is_contest_room: bool
    practice_id: Optional[int] = None

    class Config:
        from_attributes = True


class ContestDetails(BaseModel):
    id: int
    name: str
    desc: Optional[str]
    query: str
    starts_at: datetime
    ends_at: datetime
    num_participants: int
    participants: List[UserSummary]
    players_per_room: int
    missions_per_room: int
    is_user_registered: bool
    is_started: bool
    is_ended: bool
    is_rated: bool
    user_room_id: Optional[int]
    room_details: Dict[int, RoomDetail]
    min_rating: Optional[int]
    max_rating: Optional[int]


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
    user_summary: UserSummary


class MessagePayload(BaseModel):
    handle: Optional[str] = None
    type: str
    message: str
    time: str
    team_index: Optional[int] = None


class MessageData(BaseModel):
    roomId: int
    payload: MessagePayload


class SiteStats(BaseModel):
    num_members: int
    num_solved_missions: int
    num_active_users: int
    updated_at: datetime


class LeaderboardEntry(BaseModel):
    member_summary: UserSummary
    points: int
    num_solved_missions: int


class Leaderboards(BaseModel):
    updated_at: datetime
    leaderboards: List[LeaderboardEntry]


class ActiveUsersData(BaseModel):
    updated_at: datetime
    active_users: Dict[str, Optional[int]]


class PracticeSummary(BaseModel):
    id: int
    name: str
    platform: Platform
    difficulty: int
    num_missions: int
    duration: int
    your_rank: Optional[int] = None
    your_room_id: Optional[int] = None
