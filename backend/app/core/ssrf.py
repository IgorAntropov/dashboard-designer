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


def is_safe_url(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in ALLOWED_SCHEMES or not parsed.hostname:
        return False

    host = parsed.hostname
    try:
        ipaddress.ip_address(host)
        return _ip_is_public(host)
    except ValueError:
        pass

    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    try:
        infos = socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)
    except OSError:
        return False
    if not infos:
        return False
    return all(_ip_is_public(info[4][0]) for info in infos)


async def safe_fetch(url: str, max_bytes: int, timeout: float) -> Any | None:
    if not is_safe_url(url):
        return None
    try:
        async with httpx.AsyncClient(
            timeout=timeout, follow_redirects=False
        ) as client:
            response = await client.get(url)
            if response.status_code != 200:
                return None
            if len(response.content) > max_bytes:
                return None
            return response.json()
    except Exception:
        return None
