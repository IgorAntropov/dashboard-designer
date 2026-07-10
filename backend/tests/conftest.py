from collections.abc import AsyncGenerator

import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_session
from app.main import create_app


@pytest_asyncio.fixture
async def session() -> AsyncGenerator[AsyncSession, None]:
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as db_session:
        yield db_session

    await engine.dispose()


@pytest_asyncio.fixture
async def app_with_db() -> AsyncGenerator[FastAPI, None]:
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_session() -> AsyncGenerator:
        async with factory() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = override_get_session

    yield app

    await engine.dispose()


@pytest_asyncio.fixture
async def client(app_with_db: FastAPI) -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app_with_db)
    async with AsyncClient(transport=transport, base_url="http://test") as http_client:
        yield http_client


@pytest_asyncio.fixture
def activate_tier(client: AsyncClient):
    import base64
    import hashlib
    import hmac
    import json

    async def _activate(headers: dict[str, str], amount: int) -> None:
        me = await client.get("/api/v1/me", headers=headers)
        user_id = me.json()["id"]
        body = json.dumps(
            {
                "TransactionId": f"tx-{amount}-{user_id}",
                "AccountId": user_id,
                "Status": "Completed",
                "Amount": amount,
            }
        ).encode()
        signature = base64.b64encode(
            hmac.new(b"", body, hashlib.sha256).digest()
        ).decode()
        response = await client.post(
            "/api/v1/billing/webhook/cloudpayments",
            content=body,
            headers={
                "Content-HMAC": signature,
                "Content-Type": "application/json",
            },
        )
        assert response.status_code == 200

    return _activate
