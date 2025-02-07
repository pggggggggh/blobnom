import json
from datetime import datetime

import pytz
from redis.asyncio import Redis

from src.app.core.socket import sio
from src.app.db.redis import get_redis


def get_sids_in_room(room_id):
    if "/" not in sio.manager.rooms:
        return []
    return list(sio.manager.rooms['/'].get(f"room_{room_id}", set()))


async def send_system_message(message, room_id):
    message_payload = {
        "type": "system",
        "message": message,
        "time": str(datetime.now(pytz.UTC)),
    }
    await sio.emit("room_new_message", message_payload, room=f"room_{room_id}")
    await cache_message(message_payload, room_id)


async def cache_message(message_payload, room_id):
    redis: Redis = await get_redis()
    if redis:
        cache_key = f"room:{room_id}:messages"
        await redis.rpush(cache_key, json.dumps(message_payload))
        await redis.ltrim(cache_key, -100, -1)
