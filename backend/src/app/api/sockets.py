from datetime import datetime

import pytz
import socketio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from src.app.db.redis import get_redis
from src.app.schemas.schemas import MessageData
from src.app.utils.connection_manager import ConnectionManager
from src.app.utils.logger import logger
from src.app.utils.security_utils import get_handle_by_token

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
sio_app = socketio.ASGIApp(sio)


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
    redis = await get_redis()
    if redis:
        await redis.delete(f"room:{room_id}:details")  # update cache
    if room_id:
        await sio.enter_room(sid, f"room_{room_id}")
    handle = data.get("handle")
    if handle:
        await sio.emit("room_new_message", {
            "type": "system",
            "message": f"{handle}님이 접속하셨습니다.",
            "time": str(datetime.now(pytz.UTC)),
        }, room=f"room_{room_id}")


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
        await sio.emit("room_new_message", {
            "type": "system",
            "message": f"{handle}님이 퇴장하셨습니다.",
            "time": str(datetime.now(pytz.UTC)),
        }, room=f"room_{room_id}")


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
