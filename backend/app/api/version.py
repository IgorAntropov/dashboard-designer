from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["meta"])


@router.get("/version")
async def version() -> dict[str, str]:
    return {"version": get_settings().app_version}
