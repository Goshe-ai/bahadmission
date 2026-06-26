import { Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskCardActionsProps {
  task: Task;
  onAdvance: (t: Task) => void;
  onDuplicate: (t: Task) => void;
  onDelete: (id: string) => void;
}

const advanceLabel = (task: Task) =>
  task.status === 'pending' ? 'התחל ביצוע' : task.status === 'in_progress' ? 'סמן הושלם' : 'פתח מחדש';

export function TaskCardActions({ task, onAdvance, onDuplicate, onDelete }: TaskCardActionsProps) {
  return (
    <div className="flex items-center justify-between mt-2 mr-6 pt-2 border-t border-slate-100 dark:border-slate-700">
      <div className="flex gap-1">
        <button onClick={() => onDuplicate(task)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="שכפל">
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(task.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors" title="מחק">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <button
        onClick={() => onAdvance(task)}
        className={cn(
          'text-xs font-medium px-2.5 py-1 rounded-lg transition-colors',
          task.status === 'done'
            ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            : 'text-white bg-navy-900 dark:bg-blue-600 hover:bg-slate-700 dark:hover:bg-blue-700'
        )}
      >
        {advanceLabel(task)}
      </button>
    </div>
  );
}
