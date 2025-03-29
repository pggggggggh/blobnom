from fastapi import APIRouter, Request
from fastapi.params import Depends, Body
from sqlalchemy.orm import Session

from src.app.core.rate_limit import limiter
from src.app.db.database import get_db
from src.app.schemas.schemas import RegisterRequest, LoginRequest, BindRequest
from src.app.services.member_services import create_token, register, login, bind_account, logout
from src.app.utils.security_utils import get_handle_by_token

router = APIRouter()


@router.get('/solvedac_token')
@limiter.limit("10/minute")
async def solvedac_token(request: Request, db: Session = Depends(get_db)):
    response = await create_token(db=db)
    return response


@router.post('/register')
@limiter.limit("10/minute")
async def post_register(request: Request, register_request: RegisterRequest = Body(...), db: Session = Depends(get_db)):
    await register(register_request, db=db)


@router.post('/login')
@limiter.limit("10/minute")
async def post_login(request: Request, login_request: LoginRequest = Body(...), db: Session = Depends(get_db)):
    return await login(login_request, db=db)


@router.post('/logout')
@limiter.limit("10/minute")
async def post_logout(request: Request):
    return await logout()


@router.post('/bind')
@limiter.limit("10/minute")
async def post_bind(request: Request, bind_request: BindRequest = Body(...), db: Session = Depends(get_db),
                    token_handle: str = Depends(get_handle_by_token)):
    await bind_account(bind_request, token_handle, db=db)
