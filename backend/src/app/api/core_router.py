from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from src.app.api.endpoints import auth, rooms, members
from src.app.core.rate_limit import limiter
from src.app.db.database import get_db
from src.app.utils.misc_utils import update_all_rooms

router = APIRouter()


@limiter.limit("5/minute")
@router.get("/temp")
async def update_all(request: Request, db: Session = Depends(get_db)):
    await update_all_rooms(db)


router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
router.include_router(members.router, prefix="/members", tags=["members"])
