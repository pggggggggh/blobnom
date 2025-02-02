import asyncio
from datetime import datetime, timedelta

import pytz
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()
scheduler.start()


def run_async(func, *args, **kwargs):
    asyncio.run(func(*args, **kwargs))


def shutdown_scheduler():
    scheduler.shutdown()


def add_job(func, run_date, args=None):
    now = datetime.now(pytz.UTC)
    if run_date < now:
        run_date = now + timedelta(seconds=5)

    if asyncio.iscoroutinefunction(func):
        scheduler.add_job(run_async, 'date', run_date=run_date, args=(func, *args))
    else:
        scheduler.add_job(func, 'date', run_date=run_date, args=args)
