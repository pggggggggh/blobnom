from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session

from src.app.core.rate_limit import limiter
from src.app.db.models.models import Member
from src.app.db.session import get_db
from src.app.services.member_services import get_member_details, convert_to_member_summary
from src.app.utils.security_utils import get_handle_by_token

router = APIRouter()


@router.get('/me')
@limiter.limit("20/minute")
async def get_me(request: Request, token_handle: str = Depends(get_handle_by_token), db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.handle == token_handle).first()
    if not member:
        raise HTTPException(status_code=401, detail="Member not found")
    return await convert_to_member_summary(member, db)


@router.get('/details/{handle}')
@limiter.limit("15/minute")
async def member_details_endpoint(request: Request, handle: str, db: Session = Depends(get_db)):
    result = await get_member_details(handle, db)
    return result
