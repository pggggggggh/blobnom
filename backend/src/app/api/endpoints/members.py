from fastapi import APIRouter, Request, Depends

from src.app.core.rate_limit import limiter
from src.app.utils.security_utils import get_handle_by_token

router = APIRouter()


@router.get('/me')
@limiter.limit("20/minute")
async def get_me(request: Request, handle: str = Depends(get_handle_by_token)):
    return handle
