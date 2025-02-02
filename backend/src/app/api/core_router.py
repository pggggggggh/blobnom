from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session

from src.app.api.endpoints import auth, rooms, members, contests
from src.app.core.enums import Role
from src.app.core.rate_limit import limiter
from src.app.db.models.models import Member
from src.app.db.session import get_db
from src.app.services.contest_services import handle_contest_ready
from src.app.utils.security_utils import get_handle_by_token

router = APIRouter()


@limiter.limit("5/minute")
@router.post("/temp")
async def temp(request: Request, contest_id: int, db: Session = Depends(get_db),
               token_handle: str = Depends(get_handle_by_token)):
    member = db.query(Member).filter(Member.handle == token_handle).first()
    if member is None or member.role != Role.ADMIN:
        raise HTTPException(status_code=400, detail="")
    await handle_contest_ready(contest_id)


router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
router.include_router(members.router, prefix="/members", tags=["members"])
router.include_router(contests.router, prefix="/contests", tags=["contests"])
