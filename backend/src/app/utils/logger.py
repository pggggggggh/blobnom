import logging.handlers

PAPERTRAIL_HOST = "logs2.papertrailapp.com"
PAPERTRAIL_PORT = 38922

syslog_handler = logging.handlers.SysLogHandler(address=(PAPERTRAIL_HOST, PAPERTRAIL_PORT))
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
syslog_handler.setFormatter(formatter)

logger = logging.getLogger("uvicorn.debug")
logger.setLevel(logging.DEBUG)
logger.addHandler(syslog_handler)

access_logger = logging.getLogger("uvicorn.access")
access_logger.setLevel(logging.DEBUG)
access_logger.addHandler(syslog_handler)
