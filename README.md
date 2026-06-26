# מנהל משימות — קורס קציני (Officer Task Manager)

A production-ready task management dashboard for an IDF Officer Course (*Samaf* — סמ"פ). Built with React + TypeScript + Supabase.

## Features

- **Officer roles** — per-officer task boards (ק. הגנ"ש, קמ"צ, קחו"ם, קת"ש, קז"ל, קמ"ן)
- **Task board** — Open tasks / Completed tasks columns
- **Urgency levels** — Critical / High / Medium / Low with color coding
- **Drag to reorder** — reorder open tasks with drag & drop
- **Statistics** — open tasks, critical count, completed this week, overdue
- **Search & filters** — search by title/description, filter by urgency/status, sort
- **Export to PDF** — print current view as a formatted task list
- **Dark mode** — persistent across sessions
- **RTL** — fully right-to-left Hebrew UI
- **Optimistic updates** — UI updates instantly before server confirms

## Tech Stack

- React 18 + TypeScript (strict)
- Vite + Tailwind CSS
- Supabase (PostgreSQL)
- TanStack React Query v5
- @dnd-kit for drag & drop
- Framer Motion for animations
- jsPDF for PDF export
- react-hot-toast for notifications

---

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase/schema.sql`
3. Go to **Project Settings → API** → copy `Project URL` and `anon public` key
4. Create `.env.local`:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Vercel Deployment

1. Push project to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import project** from GitHub
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy** — every push to `main` auto-deploys.

The `vercel.json` file already includes the required SPA redirect rule.

## Project Structure

```
src/
  components/   — UI components (TaskCard, TaskModal, OfficerSelector, …)
  hooks/        — React Query data hooks (useTasks, useOfficers)
  lib/          — Supabase client, utils, PDF export
  pages/        — Dashboard page
  types/        — TypeScript interfaces & enums
supabase/
  schema.sql    — Database schema (run once in Supabase SQL Editor)
.claude/
  agents/       — Subagent configs for Claude Code
  settings.json — Auto-tsc hook
```
