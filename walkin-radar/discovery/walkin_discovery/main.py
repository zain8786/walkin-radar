"""Command line entry point.

  python -m walkin_discovery run [--source NAME] [--dry-run]
  python -m walkin_discovery verify
  python -m walkin_discovery expire

Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment.
"""
from __future__ import annotations

import argparse
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import yaml

from .fetch import FetchRefused, PoliteFetcher
from .model import ValidationError, dedupe_key, to_row, today_ist
from .parsers import PARSERS
from .store import SupabaseStore
from .verify import verify_listings

CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "sources.yaml"
log = logging.getLogger("walkin_discovery")


def load_config() -> dict:
    with open(CONFIG_PATH, encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def store_from_env() -> SupabaseStore:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return SupabaseStore(url, key)


def cmd_run(args, config: dict) -> int:
    store = None if args.dry_run else store_from_env()
    fetcher = PoliteFetcher(config["user_agent"], config.get("request_delay_seconds", 5))
    failures = 0
    for source in config["sources"]:
        if args.source and source["name"] != args.source:
            continue
        started = utc_now_iso()
        if not source.get("allowed"):
            log.info("skipping %s: not approved", source["name"])
            continue
        parse = PARSERS.get(source["parser"])
        if parse is None:
            log.error("unknown parser %s for %s", source["parser"], source["name"])
            failures += 1
            continue
        run = {"source_name": source["name"], "job": "run", "started_at": started}
        try:
            html_text = fetcher.get(source["url"])
            listings = parse(html_text, source)
            today = today_ist()
            rows, seen = [], set()
            for listing in listings:
                key = dedupe_key(listing)
                if key in seen:
                    continue  # duplicate within one page
                seen.add(key)
                rows.append(to_row(listing, utc_now_iso(), today))
            existing = set() if store is None else store.existing_dedupe_keys()
            run.update(found=len(rows), added=sum(1 for r in rows if r["dedupe_key"] not in existing),
                       updated=sum(1 for r in rows if r["dedupe_key"] in existing))
            if store is not None:
                store.upsert_listings(rows)
            run["status"] = "ok"
            log.info("%s: found=%d added=%d updated=%d", source["name"], run["found"], run["added"], run["updated"])
        except (FetchRefused, ValidationError, NotImplementedError) as exc:
            run.update(status="skipped", error=str(exc))
            log.warning("%s skipped: %s", source["name"], exc)
        except Exception as exc:  # any other failure is recorded, never hidden
            run.update(status="failed", error=str(exc)[:500])
            failures += 1
            log.exception("%s failed", source["name"])
        run["finished_at"] = utc_now_iso()
        if store is not None:
            store.log_run(run)
    return 1 if failures else 0


def cmd_expire(args, config: dict) -> int:
    if args.dry_run:
        print("dry run: would expire listings whose interview date has passed")
        return 0
    store = store_from_env()
    now = utc_now_iso()
    count = store.expire_past(today_ist().isoformat(), now)
    log.info("expired %d listings", count)
    store.log_run({"source_name": "all", "job": "expire", "started_at": now, "finished_at": utc_now_iso(),
                   "found": count, "status": "ok"})
    return 0


def cmd_verify(args, config: dict) -> int:
    if args.dry_run:
        print("dry run: would verify listings against their source pages")
        return 0
    store = store_from_env()
    fetcher = PoliteFetcher(config["user_agent"], config.get("request_delay_seconds", 5))
    allowed_hosts = {urlparse(s["url"]).netloc for s in config["sources"] if s.get("allowed")}
    rows = store.upcoming_for_verification(today_ist().isoformat())
    now = utc_now_iso()
    changes = verify_listings(rows, fetcher, allowed_hosts)
    for listing_id, status in changes:
        store.set_verification(listing_id, status, now)
    log.info("verified %d listings, %d changed", len(changes), sum(1 for _, s in changes if s != "upcoming"))
    store.log_run({"source_name": "all", "job": "verify", "started_at": now, "finished_at": utc_now_iso(),
                   "found": len(changes), "status": "ok"})
    return 0


def main(argv=None) -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    parser = argparse.ArgumentParser(prog="walkin_discovery")
    sub = parser.add_subparsers(dest="command", required=True)
    run_p = sub.add_parser("run", help="fetch approved sources and save listings")
    run_p.add_argument("--source")
    run_p.add_argument("--dry-run", action="store_true", help="parse and report without writing")
    for name in ("expire", "verify"):
        p = sub.add_parser(name)
        p.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)
    config = load_config()
    handlers = {"run": cmd_run, "expire": cmd_expire, "verify": cmd_verify}
    return handlers[args.command](args, config)


if __name__ == "__main__":
    sys.exit(main())
