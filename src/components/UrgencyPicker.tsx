import { cn } from '@/lib/utils';
import { URGENCY_CONFIG, URGENCY_STRIP } from '@/types';
import type { UrgencyLevel } from '@/types';

const URGENCY_LEVELS: UrgencyLevel[] = ['critical', 'high', 'medium', 'low'];

interface UrgencyPickerProps {
  value: UrgencyLevel;
  onChange: (u: UrgencyLevel) => void;
}

export function UrgencyPicker({ value, onChange }: UrgencyPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {URGENCY_LEVELS.map((u) => {
        const cfg = URGENCY_CONFIG[u];
        const isSelected = value === u;
        return (
          <button
            key={u}
            type="button"
            onClick={() => onChange(u)}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 transition-all',
              isSelected ? `${cfg.bg} ${cfg.border} shadow-sm` : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
            )}
          >
            <div className={cn('w-4 h-4 rounded-full', URGENCY_STRIP[u])} />
            <span className={cn('text-xs font-medium', isSelected ? cfg.color : 'text-slate-600 dark:text-slate-400')}>
              {cfg.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
