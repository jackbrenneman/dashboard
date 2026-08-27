-- School section: task list, upcoming due dates, and important links.
-- Run once in the Supabase SQL Editor (Project > SQL Editor > New query).

create table if not exists school_todos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null,
  done       boolean not null default false,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists school_todos_user_position_idx on school_todos(user_id, position);

create table if not exists school_due_dates (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null,
  date       date not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists school_due_dates_user_date_idx on school_due_dates(user_id, date);

create table if not exists school_links (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null,
  url        text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists school_links_user_position_idx on school_links(user_id, position);

alter table school_todos enable row level security;
alter table school_due_dates enable row level security;
alter table school_links enable row level security;

create policy "owner_select" on school_todos for select using (auth.uid() = user_id);
create policy "owner_insert" on school_todos for insert with check (auth.uid() = user_id);
create policy "owner_update" on school_todos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on school_todos for delete using (auth.uid() = user_id);

create policy "owner_select" on school_due_dates for select using (auth.uid() = user_id);
create policy "owner_insert" on school_due_dates for insert with check (auth.uid() = user_id);
create policy "owner_update" on school_due_dates for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on school_due_dates for delete using (auth.uid() = user_id);

create policy "owner_select" on school_links for select using (auth.uid() = user_id);
create policy "owner_insert" on school_links for insert with check (auth.uid() = user_id);
create policy "owner_update" on school_links for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_delete" on school_links for delete using (auth.uid() = user_id);
