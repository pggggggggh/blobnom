from fastapi import APIRouter
from fastapi.params import Depends, Body
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.schemas.schemas import RegisterRequest
from src.services.member_services import create_solvedac_token, register

router = APIRouter()


@router.get('/auth/solvedac_token')
async def solvedac_token(db: Session = Depends(get_db)):
    token_str = await create_solvedac_token(db=db)
    return {"token": token_str}


@router.post('/auth/register')
async def post_register(register_request: RegisterRequest = Body(...), db: Session = Depends(get_db)):
    await register(register_request, db=db)
