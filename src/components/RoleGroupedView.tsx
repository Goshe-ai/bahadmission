import { AnimatePresence } from 'framer-motion';
import { OFFICER_LABELS, OFFICER_ROLES_LIST } from '@/types';
import type { Task, OfficerRole } from '@/types';
import { TaskCard } from './TaskCard';

interface RoleGroupedViewProps {
  tasks: Task[];
  isLoading?: boolean;
  onEdit: (t: Task) => void;
  onAdvance: (t: Task) => void;
  onComplete?: (t: Task) => void;
  onConfirm?: (taskId: string, role: Exclude<OfficerRole, 'all'>) => void;
  onUnconfirm?: (taskId: string, role: Exclude<OfficerRole, 'all'>) => void;
  onDuplicate: (t: Task) => void;
  onDelete: (id: string) => void;
}

export function RoleGroupedView({ tasks, isLoading, ...cardProps }: RoleGroupedViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const groups = OFFICER_ROLES_LIST
    .map((role) => ({
      role,
      open: tasks.filter(
        (t) => t.status !== 'done' && (t.officer_roles.includes(role) || t.officer_roles.includes('all'))
      ),
      done: tasks.filter(
        (t) => t.status === 'done' && (t.officer_roles.includes(role) || t.officer_roles.includes('all'))
      ),
    }))
    .filter((g) => g.open.length + g.done.length > 0);

  if (groups.length === 0) {
    return (
      <div className="h-20 flex items-center justify-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
        אין משימות
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(({ role, open, done }) => (
        <div key={role}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {OFFICER_LABELS[role]}
            </h3>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              {open.length}
              {done.length > 0 && ` / ${done.length} הושלמו`}
            </span>
          </div>

          <div className="space-y-2 border-r-2 border-slate-200 dark:border-slate-700 pr-3">
            <AnimatePresence initial={false}>
              {open.map((task) => (
                <TaskCard key={task.id} task={task} showOfficer={false} viewerRole={undefined} {...cardProps} />
              ))}
              {done.map((task) => (
                <TaskCard key={task.id} task={task} showOfficer={false} viewerRole={undefined} {...cardProps} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
