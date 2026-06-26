import { cn } from '@/lib/utils';
import { STATUS_CONFIG, URGENCY_CONFIG } from '@/types';
import type { TaskStatus, UrgencyLevel } from '@/types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', cfg.color, cfg.bg, className)}>
      {cfg.label}
    </span>
  );
}

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const cfg = URGENCY_CONFIG[urgency];
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold border', cfg.color, cfg.bg, cfg.border, className)}>
      {cfg.label}
    </span>
  );
}
