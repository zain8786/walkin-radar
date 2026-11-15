# WalkIn Radar

A small website for me and a few friends that shows genuine walk-in interviews for freshers and entry-level graduates in Delhi NCR, and tells each person whether they are eligible.

**Status:** Revised scope. No code yet.

## Scope in one paragraph

One public URL. No accounts, no logins, no invitations, no admin roles. Each person's profile lives in their own browser (localStorage). Shared walk-in listings live in one small cloud database, filled by an automated job that runs in the cloud. The job only uses sources that permit automated access, and every listing links to its original source.

## Documents

| File | Purpose |
|---|---|
| [docs/01-PRD.md](docs/01-PRD.md) | What the app does and does not do |
| [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) | Stack, components, data flow |
| [docs/03-DATABASE.md](docs/03-DATABASE.md) | The one shared table, and what stays in the browser |
| [docs/07-MILESTONES.md](docs/07-MILESTONES.md) | Build order, aiming for a deployed MVP first |
| docs/archive/ | Earlier drafts for multi-user and admin features. Not current. |

## Principles

1. Never show a listing without its original source link and verification time.
2. Expired or cancelled drives never appear as upcoming.
3. Keep it small. If a feature is not needed for friends to find and judge drives, it waits.
