import { AlertTriangle, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isOverdue, isCompletedThisWeek } from '@/lib/utils';
import type { Task } from '@/types';

interface StatsCardsProps {
  tasks: Task[];
}

export function StatsCards({ tasks }: StatsCardsProps) {
  const open = tasks.filter((t) => t.status !== 'done');
  const critical = tasks.filter((t) => (t.urgency === 'critical' || t.urgency === 'high') && t.status !== 'done');
  const completedThisWeek = tasks.filter((t) => t.status === 'done' && isCompletedThisWeek(t.completed_at));
  const overdue = tasks.filter((t) => isOverdue(t.due_date) && t.status !== 'done');

  const cards = [
    {
      icon: ListTodo,
      label: 'משימות פתוחות',
      value: open.length,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-800',
    },
    {
      icon: AlertTriangle,
      label: 'דחוף / דחוף מאוד',
      value: critical.length,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      iconBg: 'bg-red-100 dark:bg-red-800',
    },
    {
      icon: CheckCircle2,
      label: 'הושלמו השבוע',
      value: completedThisWeek.length,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-800',
    },
    {
      icon: Clock,
      label: 'באיחור',
      value: overdue.length,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      iconBg: 'bg-orange-100 dark:bg-orange-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={cn('rounded-xl p-3.5 border border-transparent', c.bg)}>
          <div className="flex items-center gap-2.5">
            <div className={cn('p-2 rounded-lg', c.iconBg)}>
              <c.icon className={cn('w-4 h-4', c.color)} />
            </div>
            <div>
              <div className={cn('text-2xl font-bold', c.color)}>{c.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
