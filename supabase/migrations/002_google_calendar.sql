-- Google Calendar integration (read-only sync).
-- Run once in the Supabase SQL Editor (Project > SQL Editor > New query).

-- 1. Google Calendar connection (one row per user).
--    Tokens are AES-256-GCM encrypted at rest by the app before insert.
create table if not exists google_calendar_tokens (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  refresh_token           text not null,
  access_token            text,
  access_token_expires_at timestamptz,
  calendar_email          text,
  scope                   text,
  needs_reconnect         boolean not null default false,
  connected_at            timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table google_calendar_tokens enable row level security;

create policy "owner_select" on google_calendar_tokens for select using (auth.uid() = user_id);
create policy "owner_insert" on google_calendar_tokens for insert with check (auth.uid() = user_id);
create policy "owner_update" on google_calendar_tokens for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on google_calendar_tokens for delete using (auth.uid() = user_id);

-- 2. Persist the calendar panel's collapse state alongside the others.
alter table panel_collapse add column if not exists calendar boolean not null default false;
