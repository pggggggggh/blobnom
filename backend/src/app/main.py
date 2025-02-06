import asyncio

from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.cors import CORSMiddleware

from src.app.api.core_router import router as core_router
from src.app.api.sockets import sio_app
from src.app.core.rate_limit import limiter
from src.app.db.database import SessionLocal
from src.app.db.models import models
from src.app.db.redis import monitor_redis
from src.app.db.session import engine
from src.app.utils.logger import logger
from src.app.utils.misc_utils import check_unstarted_events

try:
    # models.Base.metadata.create_all(bind=engine)
    pass
except Exception as e:
    logger.error("Error creating database schema", exc_info=e)

origins = [
    "http://localhost:5173",
    "http://121.189.148.34:5173",
    "https://blobnom.netlify.app",
    "https://b5m.netlify.app",
    "http://blobnom.xyz",
    "https://blobnom.xyz",
]
app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(core_router)
app.mount("/socket.io", app=sio_app)


async def startup_event():
    try:
        logger.info("Checking unstarted rooms & contests...")
        await check_unstarted_events()
        logger.info("Startup tasks completed successfully")
        asyncio.create_task(monitor_redis())
    except Exception as e:
        logger.error("Error during startup", exc_info=e)


app.add_event_handler('startup', startup_event)
