import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CheckCircle2, Clock, ChevronDown, ChevronUp,
  GripVertical, StickyNote, AlertCircle, Users, Copy, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, isOverdue } from '@/lib/utils';
import { URGENCY_STRIP, OFFICER_LABELS, OFFICER_ROLES_LIST } from '@/types';
import type { Task, OfficerRole } from '@/types';
import { UrgencyBadge } from './StatusBadge';
import { TaskCardActions } from './TaskCardActions';

interface TaskCardProps {
  task: Task;
  showOfficer?: boolean;
  viewerRole?: Exclude<OfficerRole, 'all'>;
  onEdit: (task: Task) => void;
  onAdvance: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onConfirm?: (taskId: string, role: Exclude<OfficerRole, 'all'>) => void;
  onUnconfirm?: (taskId: string, role: Exclude<OfficerRole, 'all'>) => void;
  onDuplicate: (task: Task) => void;
  onDelete: (id: string) => void;
}

function OfficerBadges({ roles }: { roles: OfficerRole[] }) {
  if (roles.includes('all')) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
        <Users className="w-3 h-3" />
        לכולם
      </span>
    );
  }
  const displayed = roles.slice(0, 2);
  const extra = roles.length - 2;
  return (
    <>
      {displayed.map((r) => (
        <span key={r} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {OFFICER_LABELS[r]}
        </span>
      ))}
      {extra > 0 && (
        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-500">
          +{extra}
        </span>
      )}
    </>
  );
}

export function TaskCard({ task, showOfficer, viewerRole, onEdit, onAdvance, onComplete, onConfirm, onUnconfirm, onDuplicate, onDelete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const overdue = isOverdue(task.due_date) && task.status !== 'done';

  const isShared = task.officer_roles.length > 1 || task.officer_roles.includes('all');
  const isAllTask = task.officer_roles.includes('all');
  const confirmations = task.confirmations ?? [];
  const confirmCount = confirmations.length;
  const totalAssigned = isAllTask ? OFFICER_ROLES_LIST.length : task.officer_roles.filter(r => r !== 'all').length;
  const hasConfirmed = viewerRole ? confirmations.some((c) => c.officer_role === viewerRole) : false;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const handleConfirmToggle = () => {
    if (!viewerRole) return;
    if (hasConfirmed) onUnconfirm?.(task.id, viewerRole);
    else onConfirm?.(task.id, viewerRole);
  };

  const showBadges = isShared || showOfficer;

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
          {viewerRole && isShared ? (
            <button
              onClick={handleConfirmToggle}
              className={cn(
                'mt-0.5 shrink-0 w-4 h-4 rounded border-2 transition-colors',
                hasConfirmed
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-blue-400 dark:border-blue-500 hover:border-emerald-400'
              )}
            >
              {hasConfirmed && <CheckCircle2 className="w-3 h-3 text-white" />}
            </button>
          ) : viewerRole ? (
            <button
              onClick={() => onComplete?.(task)}
              className={cn(
                'mt-0.5 shrink-0 w-4 h-4 rounded border-2 transition-colors',
                task.status === 'done'
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 dark:border-slate-500 hover:border-emerald-400'
              )}
            >
              {task.status === 'done' && <CheckCircle2 className="w-3 h-3 text-white" />}
            </button>
          ) : isShared ? (
            <div className="mt-0.5 shrink-0 w-4 h-4" />
          ) : (
            <button
              onClick={() => onAdvance(task)}
              className={cn(
                'mt-0.5 shrink-0 w-4 h-4 rounded border-2 transition-colors',
                task.status === 'done'
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 dark:border-slate-500 hover:border-emerald-400'
              )}
            >
              {task.status === 'done' && <CheckCircle2 className="w-3 h-3 text-white" />}
            </button>
          )}

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
          {showBadges && <OfficerBadges roles={task.officer_roles} />}
          {task.due_date && (
            <span className={cn('flex items-center gap-0.5 text-xs', overdue ? 'text-red-600 font-semibold' : 'text-slate-500 dark:text-slate-400')}>
              {overdue && <AlertCircle className="w-3 h-3" />}
              <Clock className="w-3 h-3" />
              {formatDate(task.due_date)}
            </span>
          )}
          {task.notes && <StickyNote className="w-3.5 h-3.5 text-amber-400" />}
        </div>

        {isShared && (
          <div className="mr-6 mt-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{confirmCount}/{totalAssigned} אישרו</div>
            <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', confirmCount === totalAssigned ? 'bg-emerald-500' : 'bg-blue-400')}
                style={{ width: totalAssigned > 0 ? `${(confirmCount / totalAssigned) * 100}%` : '0%' }}
              />
            </div>
          </div>
        )}

        {task.status === 'done' && task.completed_at && !isShared && (
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

        {viewerRole && isShared ? (
          <div className="flex justify-end mt-2 mr-6 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={handleConfirmToggle}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors',
                hasConfirmed
                  ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              )}
            >
              {hasConfirmed ? 'בוצע' : 'ביצעתי'}
            </button>
          </div>
        ) : viewerRole ? (
          <div className="flex justify-end mt-2 mr-6 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => onComplete?.(task)}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors',
                task.status === 'done'
                  ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              )}
            >
              {task.status === 'done' ? 'בוצע' : 'ביצעתי'}
            </button>
          </div>
        ) : isShared ? (
          <div className="flex items-center mt-2 mr-6 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex gap-1">
              <button onClick={() => onDuplicate(task)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(task.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <TaskCardActions task={task} onAdvance={onAdvance} onDuplicate={onDuplicate} onDelete={onDelete} />
        )}
      </div>
    </motion.div>
  );
}
