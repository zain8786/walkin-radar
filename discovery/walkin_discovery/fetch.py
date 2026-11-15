"""Polite fetching: only allowed sources, robots.txt respected, one request at a time, with delays."""
from __future__ import annotations

import time

import requests

from .robots import is_fetch_allowed


class FetchRefused(Exception):
    pass


class PoliteFetcher:
    def __init__(self, user_agent: str, delay_seconds: float, timeout: int = 15):
        self.user_agent = user_agent
        self.delay_seconds = delay_seconds
        self.timeout = timeout
        self._last_request = 0.0

    def get(self, url: str) -> str:
        if not is_fetch_allowed(url, self.user_agent, timeout=self.timeout):
            raise FetchRefused(f"robots.txt does not allow fetching {url}")
        wait = self.delay_seconds - (time.monotonic() - self._last_request)
        if wait > 0:
            time.sleep(wait)
        response = requests.get(url, headers={"User-Agent": self.user_agent}, timeout=self.timeout)
        self._last_request = time.monotonic()
        response.raise_for_status()
        return response.text
