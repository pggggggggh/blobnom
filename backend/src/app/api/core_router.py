from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session

from src.app.api.endpoints import auth, rooms, members, contests
from src.app.core.enums import Role
from src.app.core.rate_limit import limiter
from src.app.db.models.models import Member
from src.app.db.session import get_db
from src.app.services.contest_services import handle_contest_ready
from src.app.services.misc_services import get_stats, get_leaderboards
from src.app.utils.security_utils import get_handle_by_token

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
router.include_router(members.router, prefix="/members", tags=["members"])
router.include_router(contests.router, prefix="/contests", tags=["contests"])


@router.get("/stats")
@limiter.limit("20/minute")
async def stats_endpoint(request: Request, db: Session = Depends(get_db)):
    return await get_stats(db)


@router.get("/leaderboards")
@limiter.limit("20/minute")
async def leaderboards_endpoint(request: Request, db: Session = Depends(get_db)):
    return await get_leaderboards(10, 0, db)
