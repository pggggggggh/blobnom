from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RoomPlayerInfo(BaseModel):
    user_id: int
    name: str
    user_index: int
    adjacent_solved_count: Optional[int]
    total_solved_count: Optional[int]
    last_solved_at: Optional[datetime]

    class Config:
        from_attributes = True

class RoomMissionInfo(BaseModel):
    problem_id: int
    solved_at: Optional[datetime]
    solved_user_id: Optional[int]

    class Config:
        from_attributes = True

class RoomSummary(BaseModel):
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class RoomDetail(BaseModel):
    created_at: Optional[datetime]
    end: Optional[datetime]
    id: int
    name: str
    public: bool
    size: int
    user_list: List[RoomPlayerInfo]
    problem_list: List[RoomMissionInfo]

    class Config:
        from_attributes = True
