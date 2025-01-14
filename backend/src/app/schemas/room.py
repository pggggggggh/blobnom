from datetime import datetime
from typing import List, Optional, Dict

from pydantic import BaseModel

from src.app.core.enums import ModeType


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
    starts_at: datetime
    ends_at: datetime


class RoomDeleteRequest(BaseModel):
    password: str


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

    class Config:
        from_attributes = True


class RoomSummary(BaseModel):
    id: int
    name: str
    starts_at: datetime
    ends_at: datetime
    owner: str
    num_players: int
    max_players: int
    num_missions: int
    num_solved_missions: int
    winner: str
    is_private: bool

    class Config:
        from_attributes = True


class RoomDetail(BaseModel):
    starts_at: Optional[datetime]
    ends_at: Optional[datetime]
    id: int
    name: str
    is_private: bool
    num_missions: int
    is_started: bool
    mode_type: ModeType
    team_info: List[RoomTeamInfo]
    mission_info: List[RoomMissionInfo]

    class Config:
        from_attributes = True
