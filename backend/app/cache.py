from __future__ import annotations

from dataclasses import dataclass
from threading import RLock
from time import monotonic
from typing import Any, Callable, Hashable


CacheKey = tuple[Hashable, ...]


@dataclass
class CacheEntry:
    value: Any
    expires_at: float


class TTLCache:
    """Small process-local TTL cache for read-heavy demo API endpoints."""

    def __init__(self, ttl_seconds: int = 30) -> None:
        self.ttl_seconds = ttl_seconds
        self._entries: dict[CacheKey, CacheEntry] = {}
        self._lock = RLock()

    def get_or_set(self, key: CacheKey, factory: Callable[[], Any]) -> Any:
        now = monotonic()
        with self._lock:
            entry = self._entries.get(key)
            if entry and entry.expires_at > now:
                return entry.value

        value = factory()

        with self._lock:
            self._entries[key] = CacheEntry(value=value, expires_at=now + self.ttl_seconds)
        return value

    def clear(self) -> None:
        with self._lock:
            self._entries.clear()


api_cache = TTLCache(ttl_seconds=30)
