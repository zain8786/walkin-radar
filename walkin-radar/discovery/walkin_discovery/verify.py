"""Re-check listings against their source pages.

A listing stays upcoming, with last_verified_at refreshed, only when its source page still
mentions its title and company. Otherwise it moves to needs_check. A failed fetch changes nothing.
"""
from __future__ import annotations

import logging

from .fetch import FetchRefused, PoliteFetcher
from .model import normalise_title

log = logging.getLogger(__name__)


def page_confirms(html_text: str, title: str, company: str) -> bool:
    haystack = normalise_title(html_text)
    return normalise_title(title) in haystack and normalise_title(company) in haystack


def verify_listings(rows: list[dict], fetcher: PoliteFetcher, allowed_hosts: set[str]) -> list[tuple[str, str]]:
    """Return (listing_id, new_status) for each listing whose status should change."""
    from urllib.parse import urlparse

    results: list[tuple[str, str]] = []
    for row in rows:
        host = urlparse(row["source_url"]).netloc
        if host not in allowed_hosts:
            continue  # only sources approved in config are ever re-visited
        try:
            html_text = fetcher.get(row["source_url"])
        except FetchRefused as exc:
            log.warning("skipping %s: %s", row["id"], exc)
            continue
        except Exception as exc:  # network error: leave the listing as it is
            log.warning("could not verify %s: %s", row["id"], exc)
            continue
        status = "upcoming" if page_confirms(html_text, row["title"], row["company"]) else "needs_check"
        results.append((row["id"], status))
    return results
