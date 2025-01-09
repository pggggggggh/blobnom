from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from src.app.core.rate_limit import limiter
from starlette.middleware.cors import CORSMiddleware

import src.app.db.models.models as models
from src.app.api.core_router import router as core_router
from src.app.api.websocket_router import router as ws_router
from src.app.db.database import engine, SessionLocal
from src.app.services.room_services import check_unstarted_rooms

try:
    models.Base.metadata.create_all(bind=engine)
except:
    pass

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
        await check_unstarted_rooms(db)
    finally:
        db.close()


app.add_event_handler('startup', startup_event)
