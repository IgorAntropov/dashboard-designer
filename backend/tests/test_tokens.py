import pytest

from app.core.tokens import create_access_token, decode_token


def test_access_token_roundtrip() -> None:
    token = create_access_token("user-1")

    payload = decode_token(token, "access")

    assert payload["sub"] == "user-1"
    assert payload["type"] == "access"


def test_wrong_type_is_rejected() -> None:
    token = create_access_token("user-1")

    with pytest.raises(ValueError):
        decode_token(token, "refresh")


def test_tampered_token_is_rejected() -> None:
    token = create_access_token("user-1")

    with pytest.raises(ValueError):
        decode_token(token + "tampered", "access")
