import os
import asyncio
import redis.asyncio as redis
from redis.exceptions import ConnectionError, TimeoutError

from src.app.utils.logger import logger

redis_client = None


async def create_redis_client():
    global redis_client
    try:
        redis_client = redis.from_url(
            os.environ["REDIS_URI"],
            socket_timeout=2,
        )
        await redis_client.ping()
        logger.info("Redis is alive")
    except (Exception, TimeoutError, ConnectionError):
        redis_client = None
        logger.error("Redis is dead")


async def monitor_redis():
    global redis_client
    while True:
        if redis_client is None:
            await create_redis_client()
        else:
            try:
                await redis_client.ping()
            except (TimeoutError, ConnectionError):
                logger.error("Redis is dead")
                redis_client = None

        await asyncio.sleep(60)


async def get_redis():
    global redis_client
    if redis_client is None:
        return None
    try:
        await redis_client.ping()
        return redis_client
    except (TimeoutError, ConnectionError):
        redis_client = None
        return None
