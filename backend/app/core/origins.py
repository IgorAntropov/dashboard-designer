from urllib.parse import urlparse


def _host(value: str) -> str:
    if "://" in value:
        return (urlparse(value).hostname or "").lower()
    return value.split("/", 1)[0].split(":", 1)[0].lower()


def origin_allowed(
    origin: str | None,
    referer: str | None,
    allowed_domains: list[str],
    self_origins: list[str],
) -> bool:
    if not allowed_domains:
        return True

    candidate = origin or referer
    if not candidate:
        return True

    host = _host(candidate)
    if not host:
        return True

    permitted = {_host(item) for item in allowed_domains}
    permitted |= {_host(item) for item in self_origins}
    return host in permitted
