from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.billing import router as billing_router
from app.api.dashboards import router as dashboards_router
from app.api.health import router as health_router
from app.api.oauth import router as oauth_router
from app.api.public import router as public_router
from app.api.users import router as users_router
from app.api.version import router as version_router
from app.api.ws import router as ws_router
from app.core.config import Settings, get_settings
from app.core.security import customize_openapi


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    docs_url = "/docs" if settings.docs_enabled else None
    redoc_url = "/redoc" if settings.docs_enabled else None
    openapi_url = "/openapi.json" if settings.docs_enabled else None

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    prefix = settings.api_v1_prefix
    app.include_router(health_router, prefix=prefix)
    app.include_router(version_router, prefix=prefix)
    app.include_router(auth_router, prefix=prefix)
    app.include_router(oauth_router, prefix=prefix)
    app.include_router(users_router, prefix=prefix)
    app.include_router(dashboards_router, prefix=prefix)
    app.include_router(billing_router, prefix=prefix)
    app.include_router(public_router, prefix=prefix)
    app.include_router(ws_router, prefix=prefix)
    customize_openapi(app, settings)
    return app


app = create_app()
