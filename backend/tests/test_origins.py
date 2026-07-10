from app.core.origins import origin_allowed


def test_empty_allowlist_allows_any() -> None:
    assert origin_allowed("https://evil.com", None, [], [])


def test_missing_origin_is_allowed() -> None:
    assert origin_allowed(None, None, ["customer.com"], [])


def test_allowed_host_passes() -> None:
    assert origin_allowed("https://customer.com", None, ["customer.com"], [])
    assert origin_allowed(
        "https://customer.com/page", None, ["customer.com"], []
    )


def test_self_origin_passes() -> None:
    assert origin_allowed(
        "http://localhost:3000",
        None,
        ["customer.com"],
        ["http://localhost:3000"],
    )


def test_disallowed_origin_blocked() -> None:
    assert not origin_allowed(
        "https://evil.com", None, ["customer.com"], ["http://localhost:3000"]
    )


def test_referer_fallback() -> None:
    assert origin_allowed(
        None, "https://customer.com/dash", ["customer.com"], []
    )
