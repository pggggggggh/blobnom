import math
import random
from datetime import datetime, timedelta
from typing import Optional

import httpx
import pytz
from fastapi import Body, HTTPException, Depends, APIRouter, status, Request
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from src.app.core.constants import MAX_TEAM_PER_ROOM, REGISTER_DEADLINE_SECONDS
from src.app.core.enums import ModeType
from src.app.core.rate_limit import limiter
from src.app.db.database import get_db
from src.app.db.models.models import User, Room, RoomPlayer, RoomMission, Member, Contest
from src.app.db.redis import get_redis
from src.app.schemas.schemas import RoomCreateRequest, RoomDeleteRequest, RoomJoinRequest, RoomListRequest
from src.app.services.room_services import get_room_summary, get_room_detail, update_score, update_solver, \
    get_solved_problem_list, \
    handle_room_ready, fetch_problems, get_room_list, delete_room, join_room, problem_solved, create_room
from src.app.utils.scheduler import add_job
from src.app.utils.security_utils import hash_password, verify_password, get_handle_by_token
from src.app.utils.platforms_utils import search_problems

router = APIRouter()


@router.get("/list")
@limiter.limit("20/minute")
async def room_list_endpoint(request: Request, room_list_request: RoomListRequest = Depends(),
                             db: Session = Depends(get_db), handle: str = Depends(get_handle_by_token)):
    return await get_room_list(room_list_request, db=db, handle=handle)


@router.get("/detail/{id}")
@limiter.limit("30/minute")
async def room_detail_endpoint(request: Request, id: int, db: Session = Depends(get_db),
                               handle: str = Depends(get_handle_by_token)):
    return await get_room_detail(room_id=id, db=db, handle=handle)


@router.post("/delete/{id}")
@limiter.limit("5/minute")
async def delete_room_endpoint(request: Request, id: int, room_delete_request: RoomDeleteRequest,
                               db: Session = Depends(get_db),
                               handle: str = Depends(get_handle_by_token)):
    return await delete_room(id, room_delete_request, db=db, handle=handle)


@router.post("/join/{id}")
@limiter.limit("5/minute")
async def join_room_endpoint(request: Request,
                             id: int,
                             room_join_request: RoomJoinRequest,
                             db: Session = Depends(get_db),
                             token_handle: str = Depends(get_handle_by_token)):
    return await join_room(id, room_join_request, db, token_handle)


@router.post("/solved")
@limiter.limit("10/minute")
async def problem_solved_endpoint(request: Request, room_id: int = Body(...), problem_id: str = Body(...),
                                  db: Session = Depends(get_db), token_handle: str = Depends(get_handle_by_token)):
    return await problem_solved(room_id, problem_id, db, token_handle)


@router.post("/create")
@limiter.limit("5/minute")
async def create_room_endpoint(request: Request, room_create_request: RoomCreateRequest, db: Session = Depends(get_db),
                               token_handle: str = Depends(get_handle_by_token)):
    return await create_room(room_create_request, db, token_handle)
