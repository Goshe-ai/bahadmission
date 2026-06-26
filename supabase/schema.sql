-- Officer Task Manager — Schema
-- Run this in Supabase SQL Editor to set up the database.
--
-- Changelog:
-- v1.0 — Initial schema: tasks table with urgency, status, officer_role, sort_order

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
