from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from src.core.router import router as core_router
from src.corev2.router import router as corev2_router
import src.core.models as models
from src.database import engine

try:
    models.Base.metadata.create_all(bind=engine)
except:
    pass

origins = [
    "http://localhost:5173",
    "https://blobnom.netlify.app",
    "http://blobnom.xyz",
    "https://blobnom.xyz",
]
app = FastAPI(docs_url=None, redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(core_router)
app.include_router(corev2_router, prefix="/v2")
