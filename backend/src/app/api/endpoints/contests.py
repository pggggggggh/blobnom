from fastapi import APIRouter, Request
from fastapi.params import Depends
from sqlalchemy.orm import Session

from src.app.core.rate_limit import limiter
from src.app.db.database import get_db
from src.app.schemas.schemas import ContestCreateRequest
from src.app.services.contest_services import create_contest
from src.app.utils.security_utils import get_handle_by_token

router = APIRouter()


@router.post("/create")
@limiter.limit("5/minute")
async def create_contest_endpoint(request: Request, contest_create_request: ContestCreateRequest,
                                  db: Session = Depends(get_db),
                                  token_handle: str = Depends(get_handle_by_token)):
    response = await create_contest(contest_create_request, db, token_handle)
