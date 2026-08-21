-- Strava integration (read-only activity sync).
-- Run once in the Supabase SQL Editor (Project > SQL Editor > New query).

create table if not exists strava_tokens (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  refresh_token           text not null,
  access_token            text,
  access_token_expires_at timestamptz,
  athlete_id              bigint,
  athlete_name            text,
  scope                   text,
  needs_reconnect         boolean not null default false,
  connected_at            timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table strava_tokens enable row level security;

create policy "owner_select" on strava_tokens for select using (auth.uid() = user_id);
create policy "owner_insert" on strava_tokens for insert with check (auth.uid() = user_id);
create policy "owner_update" on strava_tokens for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on strava_tokens for delete using (auth.uid() = user_id);
