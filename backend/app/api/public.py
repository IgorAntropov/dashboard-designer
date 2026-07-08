from fastapi import APIRouter, HTTPException, status

from app.api.deps import SessionDep
from app.core.redis import get_redis
from app.schemas.embed import PublishedConfig
from app.services.embed import EmbedService

router = APIRouter(prefix="/public", tags=["public"])

CACHE_TTL_SECONDS = 60


@router.get("/embed/{token}", response_model=PublishedConfig)
async def get_embed_config(token: str, session: SessionDep) -> PublishedConfig:
    redis = get_redis()
    cache_key = f"embed:{token}"

    try:
        cached = await redis.get(cache_key)
    except Exception:
        cached = None
    if cached:
        return PublishedConfig.model_validate_json(cached)

    config = await EmbedService(session).get_config(token)
    if config is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not found"
        )

    try:
        await redis.set(cache_key, config.model_dump_json(), ex=CACHE_TTL_SECONDS)
    except Exception:
        pass

    return config
