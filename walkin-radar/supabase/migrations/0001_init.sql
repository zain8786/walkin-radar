-- WalkIn Radar: initial schema. Run once in the Supabase SQL editor.

create table if not exists public.listings (
  id                     uuid primary key default gen_random_uuid(),
  title                  text not null,
  company                text not null,
  category               text not null check (category in (
                           'IT and Software','Engineering','BPO','Customer Support',
                           'Technical Support','Operations','Sales','Other Graduate')),
  city                   text not null check (city in (
                           'Delhi','Noida','Gurugram','Greater Noida','Other NCR')),
  venue                  text,
  interview_date         date not null,
  interview_start        time,
  interview_end          time,
  accepted_qualifications text[] not null default '{}',
  required_stream        text[] not null default '{}',
  min_percentage         numeric(4,2),
  min_cgpa               numeric(3,2),
  grad_year_from         smallint,
  grad_year_to           smallint,
  max_experience_months  smallint,
  fresher_allowed        boolean,
  required_skills        text[] not null default '{}',
  salary_min             integer,
  salary_max             integer,
  source_notes           text,
  contact                text,
  source_name            text not null,
  source_url             text not null check (source_url like 'https://%'),
  status                 text not null default 'upcoming' check (status in (
                           'upcoming','needs_check','cancelled','expired')),
  first_seen_at          timestamptz not null default now(),
  last_verified_at       timestamptz,
  dedupe_key             text not null unique,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists listings_date_status_idx on public.listings (interview_date, status);
create index if not exists listings_city_idx on public.listings (city);
create index if not exists listings_category_idx on public.listings (category);

create table if not exists public.discovery_runs (
  id           bigserial primary key,
  source_name  text not null,
  job          text not null,            -- run | expire | verify
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  found        integer not null default 0,
  added        integer not null default 0,
  updated      integer not null default 0,
  status       text not null check (status in ('ok','failed','skipped')),
  error        text
);

-- Public website may read upcoming listings only. No public writes.
alter table public.listings enable row level security;
alter table public.discovery_runs enable row level security;

drop policy if exists "public read upcoming listings" on public.listings;
create policy "public read upcoming listings" on public.listings
  for select to anon
  using (status = 'upcoming' and interview_date >= (now() at time zone 'Asia/Kolkata')::date);
