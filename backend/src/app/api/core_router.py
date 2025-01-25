from fastapi import APIRouter

from src.app.api.endpoints import auth, rooms, members, contests

router = APIRouter()

# @limiter.limit("5/minute")
# @router.get("/temp")
# async def update_all(request: Request, db: Session = Depends(get_db)):
#     await update_all_rooms(db)


router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
router.include_router(members.router, prefix="/members", tags=["members"])
router.include_router(contests.router, prefix="/contests", tags=["contests"])
