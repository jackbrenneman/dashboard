-- Remove the Solids/baby-age feature and its now-unused schema.
-- Run once in the Supabase SQL Editor (Project > SQL Editor > New query).

drop table if exists foods_tried;

alter table panel_collapse drop column if exists solids;

alter table setup drop column if exists baby_birth;
