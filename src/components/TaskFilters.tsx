import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { URGENCY_CONFIG } from '@/types';
import type { UrgencyLevel, TaskStatus } from '@/types';

export interface FilterState {
  search: string;
  urgencies: UrgencyLevel[];
  statusView: 'all' | 'open' | 'done';
  sortBy: 'due_date' | 'urgency' | 'created_at';
}

interface TaskFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const URGENCY_LEVELS: UrgencyLevel[] = ['critical', 'high', 'medium', 'low'];
const STATUS_OPTIONS: { value: FilterState['statusView']; label: string }[] = [
  { value: 'all', label: 'הכל' },
  { value: 'open', label: 'פתוחות' },
  { value: 'done', label: 'הושלמו' },
];
const SORT_OPTIONS: { value: FilterState['sortBy']; label: string }[] = [
  { value: 'due_date', label: 'תאריך יעד' },
  { value: 'urgency', label: 'דחיפות' },
  { value: 'created_at', label: 'תאריך יצירה' },
];

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const toggleUrgency = (u: UrgencyLevel) => {
    const next = filters.urgencies.includes(u)
      ? filters.urgencies.filter((x) => x !== u)
      : [...filters.urgencies, u];
    onChange({ ...filters, urgencies: next });
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="חיפוש משימה..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pr-9 pl-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {filters.search && (
          <button onClick={() => onChange({ ...filters, search: '' })} className="absolute left-3 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Urgency chips */}
      <div className="flex gap-1.5">
        {URGENCY_LEVELS.map((u) => {
          const cfg = URGENCY_CONFIG[u];
          const active = filters.urgencies.includes(u);
          return (
            <button
              key={u}
              onClick={() => toggleUrgency(u)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                active ? `${cfg.color} ${cfg.bg} ${cfg.border}` : 'text-slate-500 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-slate-400'
              )}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Status toggle */}
      <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden text-xs">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, statusView: opt.value })}
            className={cn(
              'px-3 py-1.5 font-medium transition-colors',
              filters.statusView === opt.value
                ? 'bg-navy-900 dark:bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <select
        value={filters.sortBy}
        onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
        className="text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            מיון: {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function applyFilters(tasks: import('@/types').Task[], filters: FilterState, officerFilter: import('@/types').OfficerRole): import('@/types').Task[] {
  const urgencyOrder: Record<UrgencyLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const statusOrder: Record<TaskStatus, number> = { pending: 0, in_progress: 1, done: 2 };

  let result = [...tasks];

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    );
  }

  if (filters.urgencies.length > 0) {
    result = result.filter((t) => filters.urgencies.includes(t.urgency));
  }

  if (filters.statusView === 'open') {
    result = result.filter((t) => t.status !== 'done');
  } else if (filters.statusView === 'done') {
    result = result.filter((t) => t.status === 'done');
  }

  result.sort((a, b) => {
    if (filters.sortBy === 'urgency') return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (filters.sortBy === 'due_date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    }
    return b.created_at.localeCompare(a.created_at);
  });

  return result;
}
