import math
import random
from datetime import datetime, timedelta

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
from src.app.schemas.schemas import RoomCreateRequest, RoomDeleteRequest
from src.app.services.contest_services import get_contest_summary
from src.app.services.room_services import get_room_summary, get_room_detail, update_score, update_solver, \
    get_solved_problem_list, \
    handle_room_ready, fetch_problems
from src.app.utils.scheduler import add_job
from src.app.utils.security_utils import hash_password, verify_password, get_handle_by_token
from src.app.utils.solvedac_utils import search_problems

router = APIRouter()


@router.get("/list")
@limiter.limit("20/minute")
async def room_list(request: Request, page: int, search: str = "", activeOnly: bool = False, myRoomOnly: bool = False,
                    db: Session = Depends(get_db), token_handle: str = Depends(get_handle_by_token)):
    query = (
        db.query(Room)
        .options(joinedload(Room.owner).joinedload(User.member))  # owner의 member까지 미리 로드
        .filter(Room.name.ilike(f"%{search}%"))
        .filter(Room.is_deleted == False)
        .order_by(desc(Room.last_solved_at))
    )

    if activeOnly:
        query = (query
                 .filter(Room.is_private == False)
                 .filter(Room.ends_at > datetime.now(tz=pytz.UTC))
                 )
    if myRoomOnly and token_handle is not None:  # 비회원으로 요청 들어온 경우 무시
        user = db.query(User).filter(User.handle == token_handle).first()
        if user:
            query = query.join(RoomPlayer).filter(RoomPlayer.user_id == user.id)

    total_rooms = query.count()
    rooms = (
        query.offset(20 * page)
        .limit(20)
        .all()
    )

    room_list = []
    for room in rooms:
        room_data = await get_room_summary(room, db)
        room_list.append(room_data)

    contests = db.query(Contest).filter(Contest.ends_at > datetime.now(tz=pytz.UTC)).order_by(
        desc(Contest.starts_at)).limit(1)

    contest_list = []
    for contest in contests:
        contest_data = get_contest_summary(contest)
        contest_list.append(contest_data)

    return {"room_list": room_list, "upcoming_contest_list": contest_list, "total_pages": math.ceil(total_rooms / 20)}


@router.get("/detail/{id}")
@limiter.limit("15/minute")
async def room_detail(request: Request, id: int, db: Session = Depends(get_db),
                      handle: str = Depends(get_handle_by_token)):
    return await get_room_detail(room_id=id, db=db, handle=handle)


@router.post("/delete/{id}")
@limiter.limit("5/minute")
async def delete_room(request: Request, id: int, room_delete_request: RoomDeleteRequest, db: Session = Depends(get_db),
                      handle: str = Depends(get_handle_by_token)):
    room = db.query(Room).options(joinedload(Room.players)).filter(Room.id == id).first()

    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    owner_member = db.query(Member).filter(Member.handle == room.owner.handle).first()

    if owner_member is None:
        if verify_password(room_delete_request.password, room.edit_pwd) is False:
            raise HTTPException(status_code=400, detail="비밀번호가 틀립니다.")
    else:
        if handle != owner_member.handle:
            raise HTTPException(status_code=401, detail="방의 주인만 삭제할 수 있습니다.")

    total_indiv_solved_count = sum(player.indiv_solved_count for player in room.players)
    if total_indiv_solved_count > 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="두 문제 이상 풀렸으므로 삭제할 수 없습니다."
        )
    room.is_deleted = True
    db.commit()
    return {"message": "Room deleted successfully"}


@router.post("/join/{id}")
@limiter.limit("5/minute")
async def room_join(request: Request, id: int, handle: str = Body(...), password: str = Body(None),
                    db: Session = Depends(get_db),
                    token_handle: str = Depends(get_handle_by_token)):
    room = db.query(Room).options(joinedload(Room.missions)).filter(Room.id == id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    now = datetime.now(tz=pytz.UTC)
    if now < room.starts_at and now > room.starts_at - timedelta(seconds=REGISTER_DEADLINE_SECONDS):
        raise HTTPException(status_code=400, detail="방 시작 5분 전부터는 참여할 수 없습니다.")

    if room.mode_type == ModeType.LAND_GRAB_TEAM:
        raise HTTPException(status_code=400, detail="팀전에는 참여할 수 없습니다.")
    if room.is_private and verify_password(password, room.entry_pwd) is False:
        raise HTTPException(status_code=400, detail="비밀번호가 틀립니다.")

    room_players = (
        db.query(RoomPlayer)
        .options(joinedload(RoomPlayer.user))
        .filter(RoomPlayer.room_id == id)
        .all()
    )

    if len(room_players) >= room.max_players:
        raise HTTPException(status_code=400, detail="인원이 가득 찼습니다.")

    if any(player.user.handle == handle for player in room_players):
        raise HTTPException(status_code=400, detail="이미 존재하는 유저입니다.")

    if token_handle is None:  # 비회원 조인 시
        existing_member = db.query(Member).filter(Member.handle == handle).first()
        if existing_member is not None:
            raise HTTPException(status_code=400, detail="가입된 유저입니다. 로그인해주시기 바랍니다.")
    else:
        handle = token_handle

    query = "@" + handle
    solved_problems = await search_problems(query)
    if len(solved_problems) == 0:
        raise HTTPException(status_code=400, detail="유효하지 않은 핸들입니다.")

    if not db.query(User).filter(User.handle == handle).first():
        user = User(handle=handle)
        db.add(user)
        db.flush()
    user = db.query(User).filter(User.handle == handle).first()

    solved_mission_list = []

    if room.is_started:
        unsolved_problem_ids = [mission.problem_id for mission in room.missions if mission.solved_at is None]
        solved_mission_list = await get_solved_problem_list(unsolved_problem_ids, handle)
        if token_handle is None and not room.is_private and len(solved_mission_list) > 2:  # 비회원의 경우에만 제한
            raise HTTPException(status_code=400, detail="비회원은 이미 해결한 문제가 2문제를 초과하면 참여할 수 없습니다.")

    # calculate mex
    player_indices = {player.player_index for player in room_players}
    player_index = next(i for i in range(len(player_indices) + 1) if i not in player_indices)

    team_indices = {player.team_index for player in room_players}
    team_index = next(i for i in range(len(team_indices) + 1) if i not in team_indices)

    player = RoomPlayer(
        user_id=user.id,
        room_id=room.id,
        player_index=player_index,
        team_index=team_index,
        last_solved_at=room.starts_at
    )
    room.players.append(player)
    db.add(player)
    db.commit()

    if room.is_started and token_handle is None:  # 비회원인 경우, 가입하자마자 솔브 처리
        missions = db.query(RoomMission).filter(
            RoomMission.problem_id.in_(solved_mission_list),
            RoomMission.room_id == id
        ).all()
        for mission in missions:
            mission.solved_at = room.starts_at
            mission.solved_room_player_id = player.id
            mission.solved_team_index = team_index
            mission.solved_user = user
            db.add(mission)
        db.commit()
        await update_score(id, db)

    return {"success": True, "solved_mission_list": solved_mission_list}


@router.post("/solved")
@limiter.limit("10/minute")
async def room_solved(request: Request, room_id: int = Body(...), problem_id: int = Body(...),
                      db: Session = Depends(get_db), token_handle: str = Depends(get_handle_by_token)):
    room = (db.query(Room)
            .options(joinedload(Room.players))
            .options(joinedload(Room.missions))
            .filter(Room.id == room_id)
            .first())

    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    if datetime.now(tz=pytz.UTC) > room.ends_at:
        raise HTTPException(status_code=400, detail="The room has already ended")

    mission = None
    for m in room.missions:
        if m.problem_id == problem_id:
            mission = m
            break

    if mission is None:
        raise HTTPException(status_code=400, detail="The problem does not exist")

    async with httpx.AsyncClient() as client:
        target_players = []
        if token_handle is None:
            players = room.players
            for player in players:
                if player.user.member is None:
                    target_players.append(player)
            random.shuffle(target_players)
        else:
            for player in room.players:
                if player.user.handle == token_handle:
                    target_players.append(player)
                    break
            if len(target_players) == 0:
                raise HTTPException(status_code=400, detail="You are not in this room")

        verdict = await update_solver(room_id, [mission], target_players, db, client)
        if verdict is False:
            raise HTTPException(status_code=400, detail="문제가 해결되지 않았습니다. '맞았습니다!!'를 받았는데도 이 메시지가 보인다면 잠시 뒤 다시 시도해주세요.")
        await update_score(room_id, db)


@router.post("/create")
@limiter.limit("5/minute")
async def room_create(request: Request, room_request: RoomCreateRequest, db: Session = Depends(get_db),
                      token_handle: str = Depends(get_handle_by_token)):
    if room_request.max_players > MAX_TEAM_PER_ROOM:
        raise HTTPException(status_code=400)

    owner = None
    if token_handle is None:
        owner = db.query(User).filter(User.handle == room_request.owner_handle).first()
        if not owner:
            owner = User(handle=room_request.owner_handle)
            db.add(owner)
            db.flush()
    else:
        owner = db.query(User).filter(User.handle == token_handle).first()

    if token_handle is None and owner is not None and owner.member is not None:
        raise HTTPException(status_code=400, detail="가입된 유저입니다. 로그인해주시기 바랍니다.")

    problem_ids = await fetch_problems(room_request.query)  # 방 생성 시 문제 모자란지 테스트
    num_mission = 3 * room_request.size * (room_request.size + 1) + 1

    if len(problem_ids) < num_mission:
        raise HTTPException(status_code=400, detail="쿼리에 해당하는 문제 수가 너무 적습니다.")

    room = Room(
        name=room_request.title,
        query=room_request.query,
        owner=owner,
        num_mission=num_mission,
        entry_pwd=hash_password(room_request.entry_pin) if room_request.entry_pin else None,
        edit_pwd=hash_password(room_request.edit_password) if room_request.edit_password else None,
        mode_type=room_request.mode,
        max_players=room_request.max_players,
        is_started=False,
        starts_at=room_request.starts_at,
        ends_at=room_request.ends_at,
        is_private=room_request.is_private,
        last_solved_at=datetime.now(tz=pytz.UTC),
        unfreeze_offset_minutes=room_request.unfreeze_offset_minutes,
    )
    db.add(room)
    db.commit()

    for idx, (username, team_idx) in enumerate(room_request.handles.items()):
        print(username, team_idx)
        user = db.query(User).filter(User.handle == username).first()
        if not user:
            user = User(handle=username.lower())
            db.add(user)
            db.flush()
        room_player = RoomPlayer(
            user_id=user.id,
            room_id=room.id,
            player_index=idx,
            team_index=team_idx,
            last_solved_at=room_request.starts_at
        )
        room.players.append(room_player)
        db.add(room_player)
    db.commit()

    add_job(
        handle_room_ready,
        run_date=max(room_request.starts_at - timedelta(seconds=REGISTER_DEADLINE_SECONDS),
                     datetime.now(pytz.UTC) + timedelta(seconds=5)),
        args=[room.id],
    )

    return {"success": True, "roomId": room.id}
