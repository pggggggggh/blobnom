from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

import src.core.models as models
from src.core.router import router as core_router
from src.core.router_ws import router as ws_router
from src.core.utils.game_utils import check_unstarted_rooms
from src.database import engine, SessionLocal

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
