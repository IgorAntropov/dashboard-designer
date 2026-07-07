from app.core.passwords import hash_password, verify_password


def test_hash_is_not_plaintext_and_verifies() -> None:
    hashed = hash_password("password123")

    assert hashed != "password123"
    assert verify_password("password123", hashed)
    assert not verify_password("wrong-password", hashed)
