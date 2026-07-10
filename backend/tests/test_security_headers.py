from httpx import AsyncClient


async def test_security_headers_on_responses(client: AsyncClient) -> None:
    response = await client.get("/api/v1/public/embed/does-not-exist")

    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert "frame-ancestors 'none'" in response.headers["content-security-policy"]
