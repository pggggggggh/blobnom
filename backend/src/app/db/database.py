import os
from datetime import datetime

import pytz
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=30,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,  # 오래된 커넥션 재활용 (기본값 7200)
)

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
