import ipaddress
import socket
from typing import Any
from urllib.parse import urlparse

import httpx

ALLOWED_SCHEMES = {"http", "https"}


def _ip_is_public(raw: str) -> bool:
    try:
        addr = ipaddress.ip_address(raw)
    except ValueError:
        return False
    return not (
        addr.is_private
        or addr.is_loopback
        or addr.is_link_local
        or addr.is_multicast
        or addr.is_reserved
        or addr.is_unspecified
    )


def resolve_pin(url: str) -> str | None:
    parsed = urlparse(url)
    if parsed.scheme not in ALLOWED_SCHEMES or not parsed.hostname:
        return None

    host = parsed.hostname
    try:
        ipaddress.ip_address(host)
        return host if _ip_is_public(host) else None
    except ValueError:
        pass

    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    try:
        infos = socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)
    except OSError:
        return None

    ips = [str(info[4][0]) for info in infos]
    if not ips or not all(_ip_is_public(ip) for ip in ips):
        return None
    return ips[0]


def is_safe_url(url: str) -> bool:
    return resolve_pin(url) is not None


def _pin_request(request: httpx.Request, host: str, ip: str) -> None:
    request.url = request.url.copy_with(host=ip)
    request.headers["Host"] = host
    request.extensions["sni_hostname"] = host


class _PinnedTransport(httpx.AsyncHTTPTransport):
    def __init__(self, host: str, ip: str) -> None:
        super().__init__()
        self._host = host
        self._ip = ip

    async def handle_async_request(self, request: httpx.Request) -> httpx.Response:
        _pin_request(request, self._host, self._ip)
        return await super().handle_async_request(request)


async def safe_fetch(url: str, max_bytes: int, timeout: float) -> Any | None:
    pinned = resolve_pin(url)
    if pinned is None:
        return None

    host = urlparse(url).hostname or ""
    transport = _PinnedTransport(host, pinned)
    try:
        async with httpx.AsyncClient(
            transport=transport, timeout=timeout, follow_redirects=False
        ) as client:
            response = await client.get(url)
            if response.status_code != 200:
                return None
            if len(response.content) > max_bytes:
                return None
            return response.json()
    except Exception:
        return None
