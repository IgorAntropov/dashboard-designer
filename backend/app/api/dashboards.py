import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserDep, SessionDep
from app.models.dashboard import Dashboard
from app.schemas.dashboard import DashboardCreate, DashboardOut, DashboardUpdate
from app.services.dashboard import (
    DashboardNotFoundError,
    DashboardQuotaExceededError,
    DashboardService,
)

router = APIRouter(prefix="/dashboards", tags=["dashboards"])

_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Dashboard not found"
)
_QUOTA = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN, detail="Dashboard quota exceeded"
)


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
        raise _QUOTA from exc
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
        raise _QUOTA from exc
    await session.commit()
    return dashboard
