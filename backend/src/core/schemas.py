from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RoomPlayerInfo(BaseModel):
    user_id: int
    name: str
    player_index: int
    adjacent_solved_count: Optional[int]
    total_solved_count: Optional[int]
    last_solved_at: Optional[datetime]

    class Config:
        from_attributes = True

class RoomMissionInfo(BaseModel):
    problem_id: int
    solved_at: Optional[datetime]
    solved_player_index: Optional[int]
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
    num_problems: int
    num_solved_problems: int
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
    player_info: List[RoomPlayerInfo]
    mission_info: List[RoomMissionInfo]

    class Config:
        from_attributes = True
