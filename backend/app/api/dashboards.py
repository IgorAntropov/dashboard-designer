import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.api.deps import CurrentUserDep, SessionDep
from app.core.errors import AppError
from app.models.dashboard import Dashboard
from app.models.enums import SubscriptionTier
from app.schemas.dashboard import DashboardCreate, DashboardOut, DashboardUpdate
from app.schemas.embed import PublishRequest, PublishResponse
from app.services.dashboard import (
    DashboardNotFoundError,
    DashboardQuotaExceededError,
    DashboardService,
)

router = APIRouter(prefix="/dashboards", tags=["dashboards"])

_NOT_FOUND = AppError(
    status.HTTP_404_NOT_FOUND, "not_found", "Dashboard not found"
)


def _quota_error(exc: DashboardQuotaExceededError) -> AppError:
    code = "quota_widgets" if exc.reason == "widgets" else "quota_dashboards"
    return AppError(status.HTTP_403_FORBIDDEN, code, "Quota exceeded")


@router.get("", response_model=list[DashboardOut])
async def list_dashboards(
    current_user: CurrentUserDep, session: SessionDep
) -> list[Dashboard]:
    return await DashboardService(session).list_for_user(current_user)


@router.post("", response_model=DashboardOut, status_code=status.HTTP_201_CREATED)
async def create_dashboard(
    payload: DashboardCreate, current_user: CurrentUserDep, session: SessionDep
) -> Dashboard:
    try:
        dashboard = await DashboardService(session).create(current_user, payload)
    except DashboardQuotaExceededError as exc:
        raise _quota_error(exc) from exc
    await session.commit()
    return dashboard


@router.get("/{dashboard_id}", response_model=DashboardOut)
async def get_dashboard(
    dashboard_id: uuid.UUID, current_user: CurrentUserDep, session: SessionDep
) -> Dashboard:
    try:
        return await DashboardService(session).get_owned(current_user, dashboard_id)
    except DashboardNotFoundError as exc:
        raise _NOT_FOUND from exc


@router.patch("/{dashboard_id}", response_model=DashboardOut)
async def update_dashboard(
    dashboard_id: uuid.UUID,
    payload: DashboardUpdate,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> Dashboard:
    try:
        dashboard = await DashboardService(session).update(
            current_user, dashboard_id, payload
        )
    except DashboardNotFoundError as exc:
        raise _NOT_FOUND from exc
    except DashboardQuotaExceededError as exc:
        raise _quota_error(exc) from exc
    await session.commit()
    return dashboard


@router.delete("/{dashboard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dashboard(
    dashboard_id: uuid.UUID, current_user: CurrentUserDep, session: SessionDep
) -> None:
    try:
        await DashboardService(session).delete(current_user, dashboard_id)
    except DashboardNotFoundError as exc:
        raise _NOT_FOUND from exc
    await session.commit()


@router.post(
    "/{dashboard_id}/duplicate",
    response_model=DashboardOut,
    status_code=status.HTTP_201_CREATED,
)
async def duplicate_dashboard(
    dashboard_id: uuid.UUID, current_user: CurrentUserDep, session: SessionDep
) -> Dashboard:
    service = DashboardService(session)
    try:
        dashboard = await service.duplicate(current_user, dashboard_id)
    except DashboardNotFoundError as exc:
        raise _NOT_FOUND from exc
    except DashboardQuotaExceededError as exc:
        raise _quota_error(exc) from exc
    await session.commit()
    return dashboard


@router.post("/{dashboard_id}/export")
async def export_dashboard(
    dashboard_id: uuid.UUID, current_user: CurrentUserDep, session: SessionDep
) -> JSONResponse:
    if current_user.subscription_tier == SubscriptionTier.free:
        raise AppError(
            status.HTTP_403_FORBIDDEN,
            "export_paid",
            "Export requires a paid plan",
        )
    try:
        dashboard = await DashboardService(session).get_owned(
            current_user, dashboard_id
        )
    except DashboardNotFoundError as exc:
        raise _NOT_FOUND from exc

    payload = {
        "title": dashboard.title,
        "slug": dashboard.slug,
        "theme_key": dashboard.theme_key,
        "layout": dashboard.layout,
        "exported_at": datetime.now(tz=timezone.utc).isoformat(),
    }
    return JSONResponse(
        payload,
        headers={
            "Content-Disposition": f'attachment; filename="{dashboard.slug}.json"'
        },
    )


@router.post("/{dashboard_id}/publish", response_model=PublishResponse)
async def publish_dashboard(
    dashboard_id: uuid.UUID,
    payload: PublishRequest,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> PublishResponse:
    service = DashboardService(session)
    try:
        dashboard, token = await service.publish(
            current_user, dashboard_id, payload.allowed_domains
        )
    except DashboardNotFoundError as exc:
        raise _NOT_FOUND from exc
    await session.commit()
    return PublishResponse(
        token=token.token,
        allowed_domains=token.allowed_domains,
        status=dashboard.status,
    )
