-- Adds curriculum_stage to concepts so the prompt builder can deterministically
-- pick the active stage instead of inferring it from concept names.
-- Run this in the Supabase SQL editor before deploying the new code.

alter table concepts
  add column if not exists curriculum_stage int
  check (curriculum_stage between 1 and 7);

create index if not exists concepts_user_stage_idx
  on concepts(user_id, curriculum_stage);
