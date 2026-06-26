# CLAUDE.md — Officer Task Manager

## What this project is
A task management dashboard for an IDF Officer Course commander (סמ"פ).
No authentication. Data stored in Supabase. Deployed on Vercel.

## Subagent routing — delegate these, don't do them inline
- Any code review after a feature → use `code-reviewer` subagent
- Any Supabase schema change or migration → use `supabase-agent` subagent
- Any RTL / mobile / accessibility check → use `qa-agent` subagent
- Investigations across many files → always spawn a subagent, never explore inline

## Officers (Katzin Rochav roles)
Defined in `src/types/index.ts` as the `OfficerRole` type.
To add a new officer role, update the type union, OFFICER_LABELS map, and OFFICER_ROLES_LIST array.

## Key files
- `src/lib/supabase.ts` — Supabase client (reads from env vars)
- `src/hooks/useTasks.ts` — All task CRUD via React Query
- `src/types/index.ts` — Task, Officer, and UrgencyLevel types
- `src/pages/Dashboard.tsx` — Main page with DnD, filters, stats
- `src/components/TaskCard.tsx` — Individual task card
- `src/components/TaskModal.tsx` — Add/Edit task modal
- `.claude/plans/active-plan.md` — current task checklist

## Code rules (always-on)
- TypeScript strict mode — no `any`, ever
- Components max 150 lines — split if larger
- All async wrapped in try/catch with toast on error
- Loading skeletons, never spinners
- RTL (`dir="rtl"`) must work on every new component — check before marking done
- Never claim a task is done without running `tsc --noEmit` first

## Supabase schema
See `supabase/schema.sql` for table definitions.
Migrations go through the `supabase-agent` — never edit schema directly in main session.

## Deploy
Push to `main` branch → Vercel auto-deploys.
Set env vars in Vercel dashboard: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

## When compacting
Always preserve: list of completed tasks in active-plan.md, current officer roles type, last error encountered and how it was fixed.
