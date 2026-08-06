-- Adds drag-reorder support to meals, matching todos.
-- Run once in the Supabase SQL Editor.

alter table meals add column if not exists position integer not null default 0;

with ordered as (
  select id, row_number() over (partition by user_id order by created_at) - 1 as rn
  from meals
)
update meals set position = ordered.rn
from ordered
where meals.id = ordered.id;

create index if not exists meals_user_position_idx on meals(user_id, position);
