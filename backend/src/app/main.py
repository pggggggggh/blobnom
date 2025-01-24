import logging.handlers

from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.cors import CORSMiddleware

import src.app.db.models.models as models
from src.app.api.core_router import router as core_router
from src.app.api.websocket_router import router as ws_router
from src.app.core.rate_limit import limiter
from src.app.db.database import engine, SessionLocal
from src.app.services.room_services import check_unstarted_rooms

PAPERTRAIL_HOST = "logs2.papertrailapp.com"
PAPERTRAIL_PORT = 38922

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.INFO)

syslog_handler = logging.handlers.SysLogHandler(address=(PAPERTRAIL_HOST, PAPERTRAIL_PORT))
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
syslog_handler.setFormatter(formatter)
logger.addHandler(syslog_handler)

try:
    models.Base.metadata.create_all(bind=engine)
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
app.include_router(ws_router)


async def startup_event():
    db = SessionLocal()
    try:
        logger.info("Checking unstarted rooms...")
        await check_unstarted_rooms(db)
        logger.info("Startup tasks completed successfully")
    except Exception as e:
        logger.error("Error during startup", exc_info=e)
    finally:
        db.close()


app.add_event_handler('startup', startup_event)
