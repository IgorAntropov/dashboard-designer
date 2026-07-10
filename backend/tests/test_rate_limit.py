from app.core.rate_limit import hit


class FakeRedis:
    def __init__(self) -> None:
        self.store: dict[str, int] = {}

    async def incr(self, key: str) -> int:
        self.store[key] = self.store.get(key, 0) + 1
        return self.store[key]

    async def expire(self, key: str, window: int) -> bool:
        return True


class BrokenRedis:
    async def incr(self, key: str) -> int:
        raise RuntimeError("redis down")

    async def expire(self, key: str, window: int) -> bool:
        raise RuntimeError("redis down")


async def test_hit_allows_until_limit_then_blocks() -> None:
    redis = FakeRedis()
    results = [await hit(redis, "rl:auth:1.1.1.1", 3, 60) for _ in range(4)]
    assert results == [True, True, True, False]


async def test_hit_fails_open_when_redis_unavailable() -> None:
    assert await hit(BrokenRedis(), "rl:auth:1.1.1.1", 1, 60) is True
