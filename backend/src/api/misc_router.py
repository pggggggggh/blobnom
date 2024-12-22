from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.utils.misc_utils import update_all_rooms

router = APIRouter()


@router.get("/temp")
async def update_all(db: Session = Depends(get_db)):
    await update_all_rooms(db)
