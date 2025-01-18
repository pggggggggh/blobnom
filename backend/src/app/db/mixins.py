from datetime import datetime
import pytz
from sqlalchemy import Column, DateTime


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
