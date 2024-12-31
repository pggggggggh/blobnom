import random
from datetime import datetime

import httpx
import pytz
from fastapi import Body, HTTPException, Depends, APIRouter, status
from sqlalchemy.orm import Session, joinedload

from src.app.core.constants import MAX_TEAM_PER_ROOM
from src.app.core.enums import ModeType
from src.app.db.models.room import User, Room, RoomPlayer, RoomMission
from src.app.schemas.room import RoomCreateRequest, DeleteRoomRequest
from src.app.services.room_service import get_room_summary, get_room_detail
from src.app.core.utils.game_utils import update_score, update_solver, get_solved_problem_list, update_all_rooms, \
    handle_room_start, fetch_problems
from src.app.core.utils.scheduler import add_job
from src.app.core.utils.security_utils import hash_password, verify_password
from src.app.db.session import get_db

router = APIRouter()

@router.get("/detail/{id}")
async def room_detail(id: int, db: Session = Depends(get_db)):
    return get_room_detail(room_id=id, db=db)


@router.post("/delete/{id}")
async def delete_room(id: int, request: DeleteRoomRequest, db: Session = Depends(get_db)):
    room = db.query(Room).options(joinedload(Room.players)).filter(Room.id == id).first()

    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    if verify_password(request.password, room.edit_pwd) is False:
        raise HTTPException(status_code=400, detail="비밀번호가 틀립니다.")

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
async def room_join(id: int, handle: str = Body(...), password: str = Body(None), db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        room = db.query(Room).options(joinedload(Room.missions)).filter(Room.id == id).first()
        if not room:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
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

        if any(player.user.name == handle for player in room_players):
            raise HTTPException(status_code=400, detail="이미 존재하는 유저입니다.")

        query = "@" + handle
        response = await client.get("https://solved.ac/api/v3/search/problem",
                                    params={"query": query})

        if len(response.json()["items"]) == 0:
            raise HTTPException(status_code=400, detail="유효하지 않은 핸들입니다.")

        if not db.query(User).filter(User.name == handle).first():
            user = User(name=handle)
            db.add(user)
            db.flush()
        user = db.query(User).filter(User.name == handle).first()

        if room.is_started:
            unsolved_problem_ids = [mission.problem_id for mission in room.missions if mission.solved_at is None]
            solved_mission_list = await get_solved_problem_list(unsolved_problem_ids, handle, db, client)
            if not room.is_private and len(solved_mission_list) > 2:
                raise HTTPException(status_code=400, detail="이미 해결한 문제가 2문제를 초과하여 참여할 수 없습니다.")

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
        db.flush()

        if room.is_started:
            missions = db.query(RoomMission).filter(
                RoomMission.problem_id.in_(solved_mission_list),
                RoomMission.room_id == id
            ).all()
            for mission in missions:
                mission.solved_at = room.starts_at
                mission.solved_room_player_id = player.id
                mission.solved_team_index = team_index
                mission.solved_user = user
            await update_score(id, db)
        db.commit()

        return {"success": True}


@router.post("/solved/")
async def room_refresh(room_id: int = Body(...), problem_id: int = Body(...), db: Session = Depends(get_db)):
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

    async with httpx.AsyncClient() as client:
        room_players = room.players
        random.shuffle(room_players)
        await update_solver(room_id, [mission], room_players, db, client)
        await update_score(room_id, db)


@router.post("/create")
async def room_create(room_request: RoomCreateRequest, db: Session = Depends(get_db), ):
    if room_request.max_players > MAX_TEAM_PER_ROOM:
        raise HTTPException(status_code=400)

    owner = db.query(User).filter(User.name == room_request.owner_handle).first()
    if not owner:
        owner = User(name=room_request.owner_handle)
        db.add(owner)
        db.flush()

    async with httpx.AsyncClient() as client:
        problem_ids = await fetch_problems(room_request.query, client)  # 방 생성 시 문제 모자란지 테스트
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
            is_private=room_request.is_private
        )
        db.add(room)
        db.flush()

        add_job(
            handle_room_start,
            run_date=room_request.starts_at,
            args=[room.id, db],
        )

        for idx, (username, team_idx) in enumerate(room_request.handles.items()):
            print(username, team_idx)
            user = db.query(User).filter(User.name == username).first()
            if not user:
                user = User(name=username)
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
            db.flush()
        db.commit()

        print("fin")

        return {"success": True, "roomId": room.id}
