# 7. Milestones (revised, MVP first)

Goal: a live public URL with real listings and working eligibility as early as possible. Discovery comes after the MVP is working and used.

## Milestone 0: Set up (about one session)

- Create the GitHub repository (private) and a Supabase project (free tier, region near India)
- Create the Next.js project with TypeScript and Tailwind, deploy to Vercel
- Add the database key to Vercel environment variables
- Create the listings table and the read-only policy from 03-DATABASE.md
- Done when: the public URL shows a placeholder page, and the app can read an empty listings table through /api/listings.

## Milestone 1: MVP (deployed, usable by friends)

Build:
- Profile form (single page, saved to localStorage, several profiles per browser, choose active profile)
- Backup and restore of profiles as a JSON file
- /api/listings route, reading upcoming listings from Supabase
- Eligibility function (pure, unit-tested) returning Eligible, Possibly Eligible, Not Eligible, with reasons
- Dashboard: list of listings with label, company, title, date, time, venue, category, source link, last verified time
- Filters: city, category, label, date
- Listing detail view with the full information and the disclaimer that a match is not a guarantee
- Save and mark applied, stored in localStorage
- Seed script with a few rows clearly marked SAMPLE, removable with one command
- Hide cancelled and expired listings from upcoming views

Done when:
- Two friends can each enter a profile on their own phone and see different labels for the same listing.
- A listing with a passed date does not appear as upcoming.
- Every listing shows a working source link and a verification time.
- The eligibility tests pass.
- Layout works on a 360px wide phone screen.
- Deployed to the public URL and shared with friends.

Scope check: no logins, no admin screens, no notifications in this milestone.

Listings in this milestone come from manual entry in the Supabase table editor, using real sources you have checked. Sample rows are for testing only and are removed before sharing.

## Milestone 2: Automated discovery (first source)

Build:
- Source config file with one allowed source (a company career page whose terms and robots.txt permit it), with the check date recorded
- Discovery script: fetch, extract walk-in entries, normalise, upsert with dedupe key
- Verification step: re-check existing upcoming listings and update last_verified_at, or set needs_check
- GitHub Actions workflow running twice daily (08:00 and 20:00 IST), with secrets stored in GitHub
- discovery_runs logging
- Done when: the scheduled workflow runs on GitHub without the laptop on, adds at least one listing with a source link, and records a run in discovery_runs.

## Milestone 3: More sources

- Add sources one at a time, each with its terms and robots check recorded.
- Improve extraction only where a source needs it.
- Done when: each added source has a successful run in discovery_runs.

## Milestone 4: Expansion (only if the group needs it)

- Cities beyond Delhi NCR, using the same listing shape.
- Notifications only if friends ask for them.

## Rules for every milestone

- No feature is added outside the milestone it belongs to.
- Sample data is labelled SAMPLE and removed before the public URL is shared.
- Each milestone is deployed and tested before the next one starts.

## Open questions

1. Which first source should Milestone 2 use?
2. Do you want the scheduled job written in TypeScript or Python?
