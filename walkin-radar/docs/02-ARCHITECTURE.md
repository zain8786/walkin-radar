# 2. Architecture (revised)

## 2.1 Stack

| Part | Choice | Reason |
|---|---|---|
| Website | Next.js with TypeScript and Tailwind CSS, deployed on Vercel (free) | One project, public URL, simple to deploy |
| Shared data | Supabase Postgres (free tier), one table, accessed only from the server | Free, managed, no auth needed for this use |
| Discovery job | Python or TypeScript script run by GitHub Actions on a schedule (free) | Runs in the cloud, independent of the laptop, cron every few hours |
| Profiles | Browser localStorage | No accounts, no server storage |
| Secrets | Vercel environment variables and GitHub Actions secrets | Kept off the browser and out of the repo |

Why not Vercel Cron for discovery: its free tier runs jobs about once a day. GitHub Actions free scheduled runs allow every few hours, which suits walk-in announcements that appear and disappear quickly.

## 2.2 Components

```
Browser (any phone or laptop)
  |- Profile screen      -> writes localStorage
  |- Dashboard           -> reads localStorage profile + GET /api/listings
  |- Eligibility engine  -> runs in the browser (pure function)
  |
Vercel: Next.js app
  |- GET /api/listings   -> reads listings from Supabase (server key)
  |
Supabase Postgres
  |- listings table
  |- discovery_runs table
  |
GitHub Actions (scheduled, twice daily (08:00 and 20:00 IST))
  |- discovery script: fetch allowed sources -> extract -> upsert listings
  |- verify script:    re-check existing listings' source URLs -> update last_verified_at
  |- writes discovery_runs
```

## 2.3 Key decisions

1. **Eligibility runs in the browser.** Each profile stays private to its browser. The server never sees profile data, so there is no profile table and no login.
2. **One listings table.** Discovery is the only writer, plus the owner for corrections via the Supabase dashboard.
3. **Verification is re-checking, not a human sign-off.** Each run revisits listings that have not yet passed, reads their source URL, and updates last_verified_at if the drive is still stated there. If the source is gone or no longer mentions the drive, the listing is marked needs-check and is not shown as upcoming until it is confirmed again.
4. **Server-only database key.** The browser calls our own /api/listings route, which uses the database key from environment variables. The key never ships to the browser.
5. **Public read, no write route.** The website only reads. Writes happen from the scheduled job, using the database key held in GitHub secrets.

## 2.4 Discovery job

- Source list in a config file: name, URL, type, allowed (true/false), terms checked date.
- Per source: fetch with a clear user agent that includes a contact address, one request per run, a short pause between sources, and respect for robots.txt.
- Extract walk-in entries and normalise them into the listing shape.
- Duplicate check on source_url plus interview date plus title. Existing rows are updated, not duplicated.
- Each run writes one discovery_runs row: source, start, end, found, added, updated, error if any.

## 2.5 Backup and restore of profiles

The profile screen has "Download backup" (JSON file) and "Restore from file." This is the only way to keep profiles safe if browser data is cleared, and it is a few lines of code. No accounts are involved.

## 2.6 Security notes

- Database key and discovery secrets are only in Vercel environment variables and GitHub secrets.
- Row-level security is enabled on the listings table with a policy that allows public read only. Writes need the service key.
- The website shows no personal data to anyone but the person using that browser.
- Nothing is stored that is not needed for eligibility.

## 2.7 What is deliberately left out

Authentication, roles, invitations, sessions, multi-tenant data, notification services, background queues, caching layers, audit logs. Add any of these only if the group asks for them.

## 2.8 Open questions

1. Are you comfortable with a GitHub account being the place the scheduled job runs? (Needed for free scheduling.)
2. Which language do you want for the discovery script: TypeScript (same as the website) or Python (common for scraping)?

## 2.9 Decisions after review (current)

- **Scheduler:** GitHub Actions, twice daily (08:00 and 20:00 IST). Migration path: the job is a plain command (`python -m walkin_discovery run|verify|expire`) with no GitHub-specific code, so it can move to any cron host (a small cloud VM, Cloud Run jobs, or Supabase scheduled functions) by changing only the schedule file.
- **Language:** Python for discovery, parsing, extraction, deduplication, and any later AI calls. TypeScript only for the Next.js website.
- **First source:** an official company careers page with real walk-in announcements, in Delhi NCR. Starts disabled (`allowed: false` in config/sources.yaml) until a person has checked its terms and robots.txt and recorded the date.
- **Source policy:** sites that prohibit automated access are never fetched. The fetcher also checks robots.txt on every request and fails closed.
- **Duplicates:** dedupe_key = hash of source URL, interview date, and normalised title.
- **Expiry:** an expire job runs before each discovery run and moves past-dated listings to expired.
- **Verification timestamps:** last_verified_at is set only when the source page still confirms the title and company. A failed fetch leaves the timestamp alone.
- **Laptop independence:** discovery, expiry, and verification run in GitHub Actions and write to Supabase directly.
