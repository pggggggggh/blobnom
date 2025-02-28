from typing import Optional

from fastapi import APIRouter, Request, HTTPException
from fastapi.params import Depends
from sqlalchemy.orm import Session

from src.app.core.rate_limit import limiter
from src.app.db.models.models import PracticeSet, Member
from src.app.db.session import get_db
from src.app.schemas.schemas import PracticeStartRequest
from src.app.services.practice_services import get_practice_list, check_is_eligible, start_practice, get_current_rank
from src.app.utils.security_utils import get_handle_by_token

router = APIRouter()


@router.get("/list")
@limiter.limit("20/minute")
async def practice_list_endpoint(request: Request, db: Session = Depends(get_db),
                                 token_handle: Optional[str] = Depends(get_handle_by_token)):
    response = await get_practice_list(db, token_handle)
    return response


@router.post("/{id}/eligible")
@limiter.limit("5/minute")
async def practice_is_eligible(request: Request, id: int, db: Session = Depends(get_db),
                               token_handle: Optional[str] = Depends(get_handle_by_token)):
    return await check_is_eligible(id, db, token_handle)


@router.post("/{id}/start")
@limiter.limit("5/minute")
async def practice_start(request: Request, id: int, practice_start_request: PracticeStartRequest,
                         db: Session = Depends(get_db), token_handle: Optional[str] = Depends(get_handle_by_token)):
    return await start_practice(id, practice_start_request, db, token_handle)


@router.get("/{id}/rank")
@limiter.limit("10/minute")
async def practice_rank(request: Request, id: int,
                        db: Session = Depends(get_db), token_handle: Optional[str] = Depends(get_handle_by_token)):
    practice = db.query(PracticeSet).filter(PracticeSet.id == id).first()
    if not practice:
        raise HTTPException(status_code=404, detail="Practice not found")
    member = db.query(Member).filter(Member.handle == token_handle).first()

    return await get_current_rank(practice, member, db)
