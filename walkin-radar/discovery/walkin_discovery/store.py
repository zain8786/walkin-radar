"""Supabase access over its REST API, using the service role key from environment variables.

The service role key is a secret. It is read from the environment and never logged or returned.
"""
from __future__ import annotations

import requests


class SupabaseStore:
    def __init__(self, base_url: str, service_key: str, timeout: int = 20):
        self.base = base_url.rstrip("/") + "/rest/v1"
        self.timeout = timeout
        self.headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
        }

    def upsert_listings(self, rows: list[dict]) -> None:
        if not rows:
            return
        headers = {**self.headers, "Prefer": "resolution=merge-duplicates,return=minimal"}
        r = requests.post(
            f"{self.base}/listings?on_conflict=dedupe_key",
            json=rows, headers=headers, timeout=self.timeout,
        )
        r.raise_for_status()

    def existing_dedupe_keys(self) -> set[str]:
        r = requests.get(
            f"{self.base}/listings?select=dedupe_key&limit=10000",
            headers=self.headers, timeout=self.timeout,
        )
        r.raise_for_status()
        return {row["dedupe_key"] for row in r.json()}

    def expire_past(self, today_iso: str, now_iso: str) -> int:
        headers = {**self.headers, "Prefer": "return=representation"}
        r = requests.patch(
            f"{self.base}/listings?status=eq.upcoming&interview_date=lt.{today_iso}",
            json={"status": "expired", "updated_at": now_iso},
            headers=headers, timeout=self.timeout,
        )
        r.raise_for_status()
        return len(r.json())

    def upcoming_for_verification(self, today_iso: str, limit: int = 200) -> list[dict]:
        r = requests.get(
            f"{self.base}/listings?select=id,title,company,source_url,status"
            f"&status=in.(upcoming,needs_check)&interview_date=gte.{today_iso}&limit={limit}",
            headers=self.headers, timeout=self.timeout,
        )
        r.raise_for_status()
        return r.json()

    def set_verification(self, listing_id: str, status: str, now_iso: str) -> None:
        payload = {"status": status, "updated_at": now_iso}
        if status == "upcoming":
            payload["last_verified_at"] = now_iso
        r = requests.patch(
            f"{self.base}/listings?id=eq.{listing_id}",
            json=payload, headers={**self.headers, "Prefer": "return=minimal"},
            timeout=self.timeout,
        )
        r.raise_for_status()

    def log_run(self, entry: dict) -> None:
        r = requests.post(
            f"{self.base}/discovery_runs", json=entry,
            headers={**self.headers, "Prefer": "return=minimal"}, timeout=self.timeout,
        )
        r.raise_for_status()
