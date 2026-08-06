-- Paternity Leave Dashboard schema.
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Single-user app: every table is scoped to auth.uid() via RLS.

-- 1. Settings (one row per user)
create table if not exists setup (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  leave_start date,
  baby_birth  date,
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

-- 3. Foods tried
create table if not exists foods_tried (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  food       text not null,
  reaction   text check (reaction in ('liked','neutral','disliked','reaction') or reaction is null),
  logged_on  date not null default current_date,
  created_at timestamptz not null default now()
);

-- 4. Meals / food prep (flat weekly list, reorderable same as todos)
create table if not exists meals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null,
  done       boolean not null default false,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists meals_user_position_idx on meals(user_id, position);

-- 5. Panel collapse state
create table if not exists panel_collapse (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  todo     boolean not null default false,
  solids   boolean not null default false,
  foodprep boolean not null default false
);

-- Row Level Security: owner-only CRUD on every table.
alter table setup enable row level security;
alter table todos enable row level security;
alter table foods_tried enable row level security;
alter table meals enable row level security;
alter table panel_collapse enable row level security;

create policy "owner_select" on setup for select using (auth.uid() = user_id);
create policy "owner_insert" on setup for insert with check (auth.uid() = user_id);
create policy "owner_update" on setup for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on setup for delete using (auth.uid() = user_id);

create policy "owner_select" on todos for select using (auth.uid() = user_id);
create policy "owner_insert" on todos for insert with check (auth.uid() = user_id);
create policy "owner_update" on todos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on todos for delete using (auth.uid() = user_id);

create policy "owner_select" on foods_tried for select using (auth.uid() = user_id);
create policy "owner_insert" on foods_tried for insert with check (auth.uid() = user_id);
create policy "owner_update" on foods_tried for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on foods_tried for delete using (auth.uid() = user_id);

create policy "owner_select" on meals for select using (auth.uid() = user_id);
create policy "owner_insert" on meals for insert with check (auth.uid() = user_id);
create policy "owner_update" on meals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on meals for delete using (auth.uid() = user_id);

create policy "owner_select" on panel_collapse for select using (auth.uid() = user_id);
create policy "owner_insert" on panel_collapse for insert with check (auth.uid() = user_id);
create policy "owner_update" on panel_collapse for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on panel_collapse for delete using (auth.uid() = user_id);
