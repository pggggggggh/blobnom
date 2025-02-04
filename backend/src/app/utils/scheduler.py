import asyncio
from datetime import datetime, timedelta

import pytz
from apscheduler.jobstores.base import ConflictingIdError
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.schedulers.background import BackgroundScheduler

from src.app.db.session import SQLALCHEMY_DATABASE_URL
from src.app.utils.logger import logger

jobstores = {
    'default': SQLAlchemyJobStore(url=SQLALCHEMY_DATABASE_URL)
}
scheduler = BackgroundScheduler(jobstores=jobstores)
scheduler.start()


def run_async(func, *args, **kwargs):
    asyncio.run(func(*args, **kwargs))


def shutdown_scheduler():
    scheduler.shutdown()


def add_job(func, run_date, args=None, job_id=None):
    try:
        if asyncio.iscoroutinefunction(func):
            scheduler.add_job(run_async, 'date', run_date=run_date, args=(func, *args), id=job_id,
                              misfire_grace_time=60 * 60 * 24 * 365 * 100)
        else:
            scheduler.add_job(func, 'date', run_date=run_date, args=args, id=job_id,
                              misfire_grace_time=60 * 60 * 24 * 365 * 100)
    except ConflictingIdError:
        logger.info(f"Job with id {job_id} already exists")
