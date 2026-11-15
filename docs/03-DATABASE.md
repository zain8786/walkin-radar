# 3. Database (revised)

Only one table is needed in the cloud. Profiles are not stored on the server.

## 3.1 Table: listings

| Column | Type | Notes |
|---|---|---|
| id | uuid, primary key | Generated |
| title | text, required | Job title as stated by the source |
| company | text, required | |
| category | text, required | One of: IT and Software, Engineering, BPO, Customer Support, Technical Support, Operations, Sales, Other Graduate |
| city | text, required | Delhi, Noida, Gurugram, Greater Noida, Other NCR |
| venue | text | Address as stated; empty if unknown |
| interview_date | date, required | |
| interview_start | time | Empty if unknown |
| interview_end | time | Empty if unknown |
| accepted_qualifications | text[] | e.g. {'B.Tech','BCA','MCA'}; empty if not stated |
| required_stream | text[] | Empty if not stated |
| min_percentage | numeric(4,2) | Empty if not stated |
| min_cgpa | numeric(3,2) | Empty if not stated |
| grad_year_from | smallint | Empty if not stated |
| grad_year_to | smallint | Empty if not stated |
| max_experience_months | smallint | Empty if not stated |
| fresher_allowed | boolean | Null if not stated |
| required_skills | text[] | |
| salary_min | integer | Annual INR; empty if not stated |
| salary_max | integer | Annual INR; empty if not stated |
| source_notes | text | Eligibility text quoted or summarised from the source, kept for the user to read |
| contact | text | Contact details as stated by the source |
| source_name | text, required | e.g. company careers page name |
| source_url | text, required | Must start with https:// |
| status | text, required | upcoming, needs_check, cancelled, expired |
| first_seen_at | timestamptz, required | When discovery first found it |
| last_verified_at | timestamptz | Last time the source confirmed the drive |
| dedupe_key | text, unique | Hash of source_url, interview_date, title |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Rules:
- A row is never shown as upcoming if its interview date has passed or its status is not upcoming.
- status moves to expired automatically after the interview date. The verification job sets needs_check when the source no longer confirms the drive.
- Unknown values stay empty. The website shows them as "not stated" and the eligibility result becomes Possibly Eligible where that matters.

Row-level security: enabled, with one policy allowing anonymous read of rows where status = 'upcoming' (or within the last day, for "today"). No anonymous insert, update, or delete.

## 3.2 Table: discovery_runs

| Column | Type | Notes |
|---|---|---|
| id | bigserial, primary key | |
| source_name | text | |
| started_at | timestamptz | |
| finished_at | timestamptz | |
| found | integer | |
| added | integer | |
| updated | integer | |
| status | text | ok or failed |
| error | text | Empty if ok |

This table lets the owner see whether discovery is working, without any admin screens. Viewing it is done in the Supabase dashboard.

## 3.3 Browser storage (localStorage)

Key: `walkin-radar.profiles`. Value: JSON array of profile objects. Each profile contains the fields listed in 01-PRD.md section 1.3, plus:
- `id`: generated locally
- `savedListingIds`: array of listing ids marked as saved or applied, with a status per id

Key: `walkin-radar.activeProfile`. Value: the id of the profile currently in use.

Nothing else is stored in the browser. Backup file format: the same profile array as JSON, with a version number at the top.

## 3.4 Indexes

- listings(interview_date, status)
- listings(city)
- listings(category)

These are enough for a small group. Add more only if queries become slow.
