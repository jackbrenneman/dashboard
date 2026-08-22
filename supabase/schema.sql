-- Dashboard schema.
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Single-user app: every table is scoped to auth.uid() via RLS.

-- 1. Settings (one row per user)
create table if not exists setup (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  leave_start date,
  updated_at  timestamptz not null default now()
);

-- 2. Todos
create table if not exists todos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null,
  done       boolean not null default false,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists todos_user_position_idx on todos(user_id, position);

-- 3. Meals / food prep (flat weekly list, reorderable same as todos)
create table if not exists meals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null,
  done       boolean not null default false,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists meals_user_position_idx on meals(user_id, position);

-- 4. Panel collapse state
create table if not exists panel_collapse (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  todo     boolean not null default false,
  foodprep boolean not null default false,
  calendar boolean not null default false
);

-- 5. Google Calendar connection (one row per user). Tokens are
--    AES-256-GCM encrypted at rest by the app before insert.
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

-- 6. Strava connection (one user, read-only activity sync). Tokens are
--    AES-256-GCM encrypted at rest by the app before insert.
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

-- Row Level Security: owner-only CRUD on every table.
alter table setup enable row level security;
alter table todos enable row level security;
alter table meals enable row level security;
alter table panel_collapse enable row level security;
alter table google_calendar_tokens enable row level security;
alter table strava_tokens enable row level security;

create policy "owner_select" on setup for select using (auth.uid() = user_id);
create policy "owner_insert" on setup for insert with check (auth.uid() = user_id);
create policy "owner_update" on setup for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on setup for delete using (auth.uid() = user_id);

create policy "owner_select" on todos for select using (auth.uid() = user_id);
create policy "owner_insert" on todos for insert with check (auth.uid() = user_id);
create policy "owner_update" on todos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on todos for delete using (auth.uid() = user_id);

create policy "owner_select" on meals for select using (auth.uid() = user_id);
create policy "owner_insert" on meals for insert with check (auth.uid() = user_id);
create policy "owner_update" on meals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on meals for delete using (auth.uid() = user_id);

create policy "owner_select" on panel_collapse for select using (auth.uid() = user_id);
create policy "owner_insert" on panel_collapse for insert with check (auth.uid() = user_id);
create policy "owner_update" on panel_collapse for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on panel_collapse for delete using (auth.uid() = user_id);

create policy "owner_select" on google_calendar_tokens for select using (auth.uid() = user_id);
create policy "owner_insert" on google_calendar_tokens for insert with check (auth.uid() = user_id);
create policy "owner_update" on google_calendar_tokens for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on google_calendar_tokens for delete using (auth.uid() = user_id);

create policy "owner_select" on strava_tokens for select using (auth.uid() = user_id);
create policy "owner_insert" on strava_tokens for insert with check (auth.uid() = user_id);
create policy "owner_update" on strava_tokens for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on strava_tokens for delete using (auth.uid() = user_id);
