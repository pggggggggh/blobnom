import asyncio

from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()
scheduler.start()


def run_async(func, *args, **kwargs):
    asyncio.run(func(*args, **kwargs))


def shutdown_scheduler():
    scheduler.shutdown()


def add_job(func, run_date, args=None):
    if asyncio.iscoroutinefunction(func):
        scheduler.add_job(run_async, 'date', run_date=run_date, args=(func, *args))
    else:
        scheduler.add_job(func, 'date', run_date=run_date, args=args)
