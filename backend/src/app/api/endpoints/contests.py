from fastapi import APIRouter, Request
from fastapi.params import Depends
from sqlalchemy.orm import Session

from src.app.core.rate_limit import limiter
from src.app.db.database import get_db
from src.app.schemas.schemas import ContestCreateRequest
from src.app.services.contest_services import create_contest, register_contest, get_contest_details, unregister_contest, \
    get_contest_list
from src.app.utils.security_utils import get_handle_by_token

router = APIRouter()


@router.get("/list")
@limiter.limit("20/minute")
async def contest_list_endpoint(request: Request,
                                myContestOnly: bool = False,
                                db: Session = Depends(get_db), token_handle: str = Depends(get_handle_by_token)):
    response = await get_contest_list(myContestOnly, db, token_handle)
    return response


@router.post("/create")
@limiter.limit("5/minute")
async def create_contest_endpoint(request: Request, contest_create_request: ContestCreateRequest,
                                  db: Session = Depends(get_db),
                                  token_handle: str = Depends(get_handle_by_token)):
    response = await create_contest(contest_create_request, db, token_handle)
    return response


@router.post("/register/{contest_id}")
@limiter.limit("5/minute")
async def register_contest_endpoint(request: Request, contest_id: int, db: Session = Depends(get_db),
                                    token_handle: str = Depends(get_handle_by_token)):
    response = await register_contest(contest_id, db, token_handle)
    return response


@router.post("/unregister/{contest_id}")
@limiter.limit("5/minute")
async def unregister_contest_endpoint(request: Request, contest_id: int, db: Session = Depends(get_db),
                                      token_handle: str = Depends(get_handle_by_token)):
    response = await unregister_contest(contest_id, db, token_handle)
    return response


@router.get("/detail/{contest_id}")
@limiter.limit("20/minute")
async def contest_detail_endpoint(request: Request, contest_id: int, db: Session = Depends(get_db),
                                  token_handle: str = Depends(get_handle_by_token)):
    response = await get_contest_details(contest_id, db, token_handle)
    return response
