-- AI Daily Training System — schema
-- Paste into the Supabase SQL editor and run.

create extension if not exists pgcrypto;

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'me',
  session_number int not null,
  session_type text not null default 'standard'
    check (session_type in ('standard','review','mastery')),
  status text not null default 'in_progress'
    check (status in ('in_progress','complete')),
  current_phase text not null default 'learn'
    check (current_phase in ('warmup','learn','apply','adapt','reflect','complete')),
  streak int not null default 0,
  skill_estimate jsonb,
  summary jsonb,
  memory_summary jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists sessions_user_status_idx
  on sessions(user_id, status);

create table if not exists phase_data (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  phase text not null
    check (phase in ('warmup','learn','apply','adapt','reflect')),
  messages jsonb not null default '[]'::jsonb,
  user_response text,
  engagement_met boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, phase)
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'me',
  title text not null,
  state jsonb,
  status text not null default 'active'
    check (status in ('active','paused','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_status_idx
  on projects(user_id, status);

create table if not exists concepts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'me',
  concept_name text not null,
  concept_summary text not null,
  skill_domain text not null,
  curriculum_stage int check (curriculum_stage between 1 and 7),
  source_session int not null,
  strength_score real not null default 0.3,
  recall_count int not null default 0,
  last_reviewed_session int,
  last_reviewed_date timestamptz,
  next_review_target int not null,
  due_for_recall boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists concepts_user_idx
  on concepts(user_id);

create index if not exists concepts_user_stage_idx
  on concepts(user_id, curriculum_stage);
