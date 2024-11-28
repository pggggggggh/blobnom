import os
from datetime import datetime

import pytz
from sqlalchemy import create_engine, Column, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autoflush=False, bind=engine)
Base = declarative_base()

def utcnow():
    return datetime.now(pytz.utc)

class TimestampMixin:
    created_at = Column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        nullable=False
    )

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
