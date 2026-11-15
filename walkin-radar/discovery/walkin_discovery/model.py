"""Listing shape, validation, deduplication and status rules. Pure functions, no I/O."""
from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")

CATEGORIES = {
    "IT and Software", "Engineering", "BPO", "Customer Support",
    "Technical Support", "Operations", "Sales", "Other Graduate",
}
CITIES = {"Delhi", "Noida", "Gurugram", "Greater Noida", "Other NCR"}


class ValidationError(ValueError):
    pass


@dataclass
class Listing:
    title: str
    company: str
    category: str
    city: str
    interview_date: date
    source_name: str
    source_url: str
    venue: Optional[str] = None
    interview_start: Optional[str] = None      # "HH:MM", IST
    interview_end: Optional[str] = None
    accepted_qualifications: list[str] = field(default_factory=list)
    required_stream: list[str] = field(default_factory=list)
    min_percentage: Optional[float] = None
    min_cgpa: Optional[float] = None
    grad_year_from: Optional[int] = None
    grad_year_to: Optional[int] = None
    max_experience_months: Optional[int] = None
    fresher_allowed: Optional[bool] = None
    required_skills: list[str] = field(default_factory=list)
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    source_notes: Optional[str] = None
    contact: Optional[str] = None


def _clean(value: Optional[str]) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def normalise_title(title: str) -> str:
    return re.sub(r"[^a-z0-9 ]", "", _clean(title).lower())


def validate(listing: Listing) -> None:
    """Raise ValidationError if a listing lacks something required. Never fills gaps."""
    if not _clean(listing.title):
        raise ValidationError("title is required")
    if not _clean(listing.company):
        raise ValidationError("company is required")
    if listing.category not in CATEGORIES:
        raise ValidationError(f"unknown category: {listing.category!r}")
    if listing.city not in CITIES:
        raise ValidationError(f"unknown city: {listing.city!r}")
    if not isinstance(listing.interview_date, date):
        raise ValidationError("interview_date is required")
    if not listing.source_name:
        raise ValidationError("source_name is required")
    parsed = urlparse(listing.source_url or "")
    if parsed.scheme != "https" or not parsed.netloc:
        raise ValidationError("source_url must be an https URL")


def dedupe_key(listing: Listing) -> str:
    """Stable key: same source, same date, same title means the same drive."""
    raw = "|".join([
        listing.source_url.strip(),
        listing.interview_date.isoformat(),
        normalise_title(listing.title),
    ])
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def status_for(interview_date: date, today: date) -> str:
    """A drive whose day has passed is never upcoming."""
    return "expired" if interview_date < today else "upcoming"


def today_ist(now: Optional[datetime] = None) -> date:
    current = now or datetime.now(IST)
    return current.astimezone(IST).date()


def to_row(listing: Listing, now_iso: str, today: date) -> dict:
    """Row for upsert. first_seen_at is deliberately omitted so the database keeps the original value."""
    validate(listing)
    return {
        "title": _clean(listing.title),
        "company": _clean(listing.company),
        "category": listing.category,
        "city": listing.city,
        "venue": _clean(listing.venue) or None,
        "interview_date": listing.interview_date.isoformat(),
        "interview_start": listing.interview_start,
        "interview_end": listing.interview_end,
        "accepted_qualifications": listing.accepted_qualifications,
        "required_stream": listing.required_stream,
        "min_percentage": listing.min_percentage,
        "min_cgpa": listing.min_cgpa,
        "grad_year_from": listing.grad_year_from,
        "grad_year_to": listing.grad_year_to,
        "max_experience_months": listing.max_experience_months,
        "fresher_allowed": listing.fresher_allowed,
        "required_skills": listing.required_skills,
        "salary_min": listing.salary_min,
        "salary_max": listing.salary_max,
        "source_notes": _clean(listing.source_notes) or None,
        "contact": _clean(listing.contact) or None,
        "source_name": listing.source_name,
        "source_url": listing.source_url.strip(),
        "status": status_for(listing.interview_date, today),
        "last_verified_at": now_iso,
        "dedupe_key": dedupe_key(listing),
        "updated_at": now_iso,
    }
