"""Placeholder parser. Not connected to any real page yet.

When a source is approved, copy this file to parsers/<company>.py and write the
extraction for that page's actual HTML. Rules for every parser:
  - only extract facts the page states
  - skip any entry without a date, venue, and title
  - never guess a value
"""
from __future__ import annotations

from ..model import Listing


def parse(html: str, source: dict) -> list[Listing]:
    raise NotImplementedError("No approved source parser yet. See parsers/template.py.")
