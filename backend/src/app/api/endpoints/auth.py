from fastapi import APIRouter, Request
from fastapi.params import Depends, Body
from sqlalchemy.orm import Session

from src.app.core.rate_limit import limiter
from src.app.db.database import get_db
from src.app.schemas.schemas import RegisterRequest, LoginRequest
from src.app.services.member_services import create_solvedac_token, register, login

router = APIRouter()


@router.get('/solvedac_token')
@limiter.limit("5/minute")
async def solvedac_token(request: Request, db: Session = Depends(get_db)):
    response = await create_solvedac_token(db=db)
    return response


@router.post('/register')
@limiter.limit("5/minute")
async def post_register(request: Request, register_request: RegisterRequest = Body(...), db: Session = Depends(get_db)):
    await register(register_request, db=db)


@router.post('/login')
@limiter.limit("5/minute")
async def post_login(request: Request, login_request: LoginRequest = Body(...), db: Session = Depends(get_db)):
    token = await login(login_request, db=db)
    return {"result": "success", "token": token}
