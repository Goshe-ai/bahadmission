-- Officer Task Manager — Schema
-- Run this in Supabase SQL Editor to set up the database.
--
-- Changelog:
-- v1.0 — Initial schema: tasks table with urgency, status, officer_role, sort_order
-- v2.0 — Added task_confirmations table: per-officer confirmation tracking for tasks assigned to 'all'
-- v3.0 — Added officer_roles text[] to tasks: supports multiple officers per task.
--         officer_role (single, not null) is kept and will always equal officer_roles[1].
--         Existing rows are back-filled so officer_roles = ARRAY[officer_role].

create table if not exists tasks (
  id            uuid        primary key default gen_random_uuid(),
  title         text        not null,
  description   text,
  officer_role  text        not null,          -- matches OfficerRole enum (never 'all')
  urgency       text        not null default 'medium', -- 'critical' | 'high' | 'medium' | 'low'
  status        text        not null default 'pending', -- 'pending' | 'in_progress' | 'done'
  due_date      timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  notes         text,
  sort_order    integer     default 0
);

-- Auto-update updated_at on every row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_updated_at on tasks;
create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

-- Enable Row Level Security (allow all reads/writes since no auth is required)
alter table tasks enable row level security;

create policy "Allow all" on tasks
  for all using (true) with check (true);

-- -------------------------------------------------------
-- v2.0: task_confirmations
-- Tracks which officer has confirmed completion of a task
-- that was assigned to 'all' officers.
-- -------------------------------------------------------

create table if not exists task_confirmations (
  id            uuid        primary key default gen_random_uuid(),
  task_id       uuid        not null references tasks(id) on delete cascade,
  officer_role  text        not null,
  confirmed_at  timestamptz not null default now(),
  unique(task_id, officer_role)
);

alter table task_confirmations enable row level security;

create policy "Allow all" on task_confirmations
  for all using (true) with check (true);

-- -------------------------------------------------------
-- v3.0: officer_roles column on tasks
-- Adds multi-officer support. officer_role (text, not null)
-- is preserved and always equals officer_roles[1].
-- Existing rows are back-filled on first run.
-- -------------------------------------------------------

alter table tasks
  add column if not exists officer_roles text[] not null default '{}';

update tasks
  set officer_roles = ARRAY[officer_role]
  where officer_roles = '{}';
