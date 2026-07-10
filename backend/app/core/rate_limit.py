from collections.abc import Awaitable, Callable
from typing import Any

from fastapi import Depends, Request

from app.core.config import get_settings
from app.core.errors import AppError
from app.core.redis import get_redis


def client_ip(request: Request) -> str:
    if get_settings().trust_proxy_headers:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def hit(redis: Any, key: str, limit: int, window: int) -> bool:
    """Return True if the request is allowed. Fail-open on Redis errors."""
    try:
        count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, window)
        return int(count) <= limit
    except Exception:
        return True


def rate_limit(
    bucket: str, limit: int, window: int
) -> Callable[[Request], Awaitable[None]]:
    async def dependency(request: Request) -> None:
        allowed = await hit(
            get_redis(), f"rl:{bucket}:{client_ip(request)}", limit, window
        )
        if not allowed:
            raise AppError(429, "rate_limited", "Too many requests")

    return dependency


def rate_limit_dep(bucket: str, limit: int, window: int) -> Any:
    return Depends(rate_limit(bucket, limit, window))
