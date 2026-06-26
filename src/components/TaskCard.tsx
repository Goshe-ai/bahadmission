import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CheckCircle2, Clock, ChevronDown, ChevronUp,
  GripVertical, StickyNote, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, isOverdue } from '@/lib/utils';
import { URGENCY_STRIP, OFFICER_LABELS } from '@/types';
import type { Task } from '@/types';
import { UrgencyBadge } from './StatusBadge';
import { TaskCardActions } from './TaskCardActions';

interface TaskCardProps {
  task: Task;
  showOfficer?: boolean;
  onEdit: (task: Task) => void;
  onAdvance: (task: Task) => void;
  onDuplicate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, showOfficer, onEdit, onAdvance, onDuplicate, onDelete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const overdue = isOverdue(task.due_date) && task.status !== 'done';

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <motion.div
      ref={setNodeRef} style={style}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'relative bg-white dark:bg-slate-800 rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200',
        task.status === 'done' ? 'opacity-75' : '',
        overdue ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
      )}
    >
      <div className={cn('absolute top-0 right-0 bottom-0 w-1 rounded-r-xl', URGENCY_STRIP[task.urgency])} />

      <div className="p-3 pr-4">
        <div className="flex items-start gap-2">
          <button
            onClick={() => onAdvance(task)}
            className={cn(
              'mt-0.5 shrink-0 w-4 h-4 rounded border-2 transition-colors',
              task.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-500 hover:border-emerald-400'
            )}
            title={task.status === 'pending' ? 'התחל ביצוע' : task.status === 'in_progress' ? 'סמן הושלם' : 'פתח מחדש'}
          >
            {task.status === 'done' && <CheckCircle2 className="w-3 h-3 text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            <button
              onClick={() => onEdit(task)}
              className={cn(
                'text-sm font-medium text-right leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full',
                task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
              )}
            >
              {task.title}
            </button>
          </div>

          <button {...attributes} {...listeners} className="shrink-0 cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-slate-500 mt-0.5">
            <GripVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2 mr-6">
          <UrgencyBadge urgency={task.urgency} />
          {showOfficer && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {OFFICER_LABELS[task.officer_role]}
            </span>
          )}
          {task.due_date && (
            <span className={cn('flex items-center gap-0.5 text-xs', overdue ? 'text-red-600 font-semibold' : 'text-slate-500 dark:text-slate-400')}>
              {overdue && <AlertCircle className="w-3 h-3" />}
              <Clock className="w-3 h-3" />
              {formatDate(task.due_date)}
            </span>
          )}
          {task.notes && <StickyNote className="w-3.5 h-3.5 text-amber-400" title="יש הערות" />}
        </div>

        {task.status === 'done' && task.completed_at && (
          <div className="mr-6 mt-1 text-xs text-emerald-600 dark:text-emerald-400">הושלם: {formatDate(task.completed_at)}</div>
        )}

        {task.description && (
          <div className="mr-6 mt-1">
            <p className={cn('text-xs text-slate-500 dark:text-slate-400 text-right leading-relaxed', !expanded && 'line-clamp-2')}>
              {task.description}
            </p>
            {task.description.length > 80 && (
              <button onClick={() => setExpanded((e) => !e)} className="text-xs text-blue-500 flex items-center gap-0.5 mt-0.5">
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? 'פחות' : 'עוד'}
              </button>
            )}
          </div>
        )}

        {expanded && task.notes && (
          <div className="mr-6 mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-800 dark:text-amber-300 text-right">
            <span className="font-medium">הערות: </span>{task.notes}
          </div>
        )}

        <TaskCardActions task={task} onAdvance={onAdvance} onDuplicate={onDuplicate} onDelete={onDelete} />
      </div>
    </motion.div>
  );
}
