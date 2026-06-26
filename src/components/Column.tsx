import { AnimatePresence } from 'framer-motion';
import { TaskCard } from './TaskCard';
import type { Task, OfficerRole } from '@/types';

interface ColumnProps {
  title: string;
  tasks: Task[];
  isLoading?: boolean;
  showOfficer: boolean;
  viewerRole?: Exclude<OfficerRole, 'all'>;
  onEdit: (t: Task) => void;
  onAdvance: (t: Task) => void;
  onComplete?: (t: Task) => void;
  onConfirm?: (taskId: string, role: Exclude<OfficerRole, 'all'>) => void;
  onUnconfirm?: (taskId: string, role: Exclude<OfficerRole, 'all'>) => void;
  onDuplicate: (t: Task) => void;
  onDelete: (id: string) => void;
}

export function Column({ title, tasks, isLoading, showOfficer, viewerRole, onEdit, onAdvance, onComplete, onConfirm, onUnconfirm, onDuplicate, onDelete }: ColumnProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">{title}</h3>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="h-20 flex items-center justify-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          אין משימות
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showOfficer={showOfficer}
              viewerRole={viewerRole}
              onEdit={onEdit}
              onAdvance={onAdvance}
              onComplete={onComplete}
              onConfirm={onConfirm}
              onUnconfirm={onUnconfirm}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
