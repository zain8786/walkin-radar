# 5. Discovery Strategy

## 5.1 Principles

1. **Permission before collection.** A source is switched on only after its terms and robots.txt have been checked and recorded in the `sources` table.
2. **Official first.** Order of preference: official API or feed, company career page, recruiter's published announcement, job portal, social posts. Portals are used only for discovery, with the link taken back to the original announcement.
3. **Link, do not republish.** The app stores the facts needed to decide (title, date, venue, eligibility) and always links to the original. It does not copy full job descriptions.
4. **Humans verify.** Automated entries start as `unverified`. A member of the admin group confirms before they show as verified.
5. **Failure is visible.** Failed runs are logged and shown in the admin area. The app never fills gaps with guesses.

## 5.2 Milestone 1: manual entry only

Admins create listings from the publicly posted announcement, copying facts from the source. The admin form requires a source URL. This is the same path automated entries will use later, so the data shape is identical.

## 5.3 Milestone 3: adding sources

Source types, in the order to add them:

| Priority | Type | Example | Method |
|---|---|---|---|
| 1 | Company careers pages | Careers pages of IT and BPO firms hiring in NCR | Fetch public page, parse listed walk-ins, or admin-curated page list |
| 2 | Official feeds or APIs | Any company or partner feed offered publicly | Scheduled fetch of the feed |
| 3 | Recruiter announcements | Public notices on recruiter sites | Same as careers pages |
| 4 | Job portals | Public listing pages | Only where terms allow; treat as discovery, then verify at source |

Before enabling any source:
- Record the terms check date and result in `sources.terms_checked_at`.
- Confirm robots.txt allows the path. Record in `robots_allowed`.
- Set a polite rate limit: at most one request per source per run, with a delay between sources.
- Identify the app with a clear user agent that includes a contact address.

Any source that blocks automated access or requires a login is not scraped. It is linked manually.

## 5.4 Pipeline

```
Scheduler (daily, and every 6 hours in season)
  -> for each enabled source:
       fetch raw content (or feed)
       store raw snapshot (optional, for debugging, auto-deleted after 14 days)
       extract candidate listings
       normalise into listing shape
       compute content_hash
       match against existing listings by (source_id, external_id) then by hash
         - new        -> insert as unverified
         - changed    -> update fields, set status to unverified, record change
         - unchanged  -> update last_seen_at only
       log run result to sources.last_run_status
  -> nightly: expire listings whose interview date has passed
```

## 5.5 Dedupe

Two drives are duplicates when company, venue address (normalised), interview date, and start time match, regardless of source. Possible duplicates are flagged, never merged silently.

## 5.6 Freshness and verification

- Each listing shows `last_verified_at`. Listings not re-checked in 7 days are marked "Check again" in the admin area.
- A listing that cannot be re-found at its source is set to `unverified` with a warning, not deleted.

## 5.7 Future-proofing checklist for Milestone 1

- [ ] `listings.source_url` and `source_type` exist and are required.
- [ ] `listings.content_hash` is computed on save, even for manual entries.
- [ ] `sources` table exists, empty, with the columns above.
- [ ] Admin form uses the same validation function that a future adapter would call.

## 5.8 Open questions

1. Which company careers pages do you most want covered first?
2. Would you accept a manual "check now" button for the admin in place of scheduled runs?
