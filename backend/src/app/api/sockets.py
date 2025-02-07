import json
from datetime import datetime

import pytz

from src.app.db.redis import get_redis
from src.app.core.socket import sio
from src.app.schemas.schemas import MessageData
from src.app.services.socket_services import send_system_message, cache_message, get_sids_in_room
from src.app.utils.logger import logger


@sio.event
async def connect(sid, environ, auth):
    handle = auth.get("handle")
    print("connect", sid, handle)
    if handle:
        redis = await get_redis()
        if redis:
            await redis.hset("sid_to_handle", sid, handle)


@sio.event
async def disconnect(sid):
    print("disconnect", sid)
    redis = await get_redis()
    if redis:
        await redis.hdel("sid_to_handle", sid)


@sio.event
async def join_room(sid, data):
    room_id = data.get("roomId")
    if room_id:
        await sio.enter_room(sid, f"room_{room_id}")
    handle = data.get("handle")
    if handle:
        print(f"{handle} joined {room_id}")
        await send_system_message(f"{handle}님이 접속하셨습니다.", room_id)
    redis = await get_redis()
    if redis:
        sids = get_sids_in_room(room_id)
        active_users = set()
        for sid in sids:
            handle = await redis.hget("sid_to_handle", sid)
            if handle:
                active_users.add(handle.decode('utf-8'))
        await sio.emit("active_users", list(active_users))


@sio.event
async def leave_room(sid, data):
    room_id = data.get("roomId")
    redis = await get_redis()
    if redis:
        await redis.delete(f"room:{room_id}:details")
    if room_id:
        await sio.leave_room(sid, f"room_{room_id}")
    handle = data.get("handle")
    if handle:
        await send_system_message(f"{handle}님이 퇴장하셨습니다.", room_id)
    redis = await get_redis()
    if redis:
        sids = get_sids_in_room(room_id)
        active_users = set()
        for sid in sids:
            handle = await redis.hget("sid_to_handle", sid)
            if handle:
                active_users.add(handle.decode('utf-8'))
        await sio.emit("active_users", list(active_users))


@sio.event
async def room_send_message(sid, data):
    data = MessageData(**data)
    logger.info(data.payload)
    room_id = data.roomId
    if room_id:
        await sio.emit("room_new_message", {
            "handle": data.payload.handle,
            "type": data.payload.type,
            "message": data.payload.message,
            "time": str(data.payload.time),
            "team_index": data.payload.team_index,
        }, room=f"room_{room_id}")
        await cache_message(data.payload.model_dump(), room_id)
