import math
from datetime import datetime

import pytz
from fastapi import Depends, APIRouter, Request
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from src.app.db.models.room import Room
from src.app.services.room_service import get_room_summary
from src.app.core.utils.game_utils import update_all_rooms
from src.app.api.endpoints import rooms
from src.app.core.rate_limit import limiter
from src.app.db.session import get_db

router = APIRouter()


@router.get("/")
@limiter.limit("20/minute")
async def room_list(
    request: Request,
    page: int,
    search: str = "",
    activeOnly: bool = False,
    db: Session = Depends(get_db)
):
    # 쿼리에 검색 필터 추가
    query = (
        db.query(Room)
        .options(joinedload(Room.players))
        .options(joinedload(Room.missions))
        .options(joinedload(Room.owner))
        .filter(Room.name.ilike(f"%{search}%"))
        .filter(Room.is_deleted == False)
        .order_by(desc(Room.updated_at))
    )

    if activeOnly:
        query = (query
                 .filter(Room.is_private == False)
                 .filter(Room.ends_at > datetime.now(tz=pytz.UTC))
                 )

    total_rooms = query.count()
    rooms = (
        query.offset(20 * page)
        .limit(20)
        .all()
    )

    room_list = []
    for room in rooms:
        room_data = get_room_summary(room)
        room_list.append(room_data)

    return {"room_list": room_list, "total_pages": math.ceil(total_rooms / 20)}

@router.get("/temp")
@limiter.limit("5/minute")
async def update_all(request: Request, db: Session = Depends(get_db)):
    await update_all_rooms(db)


router.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
