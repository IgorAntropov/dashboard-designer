from passlib.context import CryptContext

_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    return _context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _context.verify(password, password_hash)
