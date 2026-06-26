import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { OFFICER_LABELS, OFFICER_ROLES_LIST } from '@/types';
import type { OfficerRole } from '@/types';

interface OfficerSelectorProps {
  selected: OfficerRole;
  onChange: (role: OfficerRole) => void;
}

const ALL_OPTIONS: OfficerRole[] = ['all', ...OFFICER_ROLES_LIST];

export function OfficerSelector({ selected, onChange }: OfficerSelectorProps) {
  return (
    <div className="overflow-x-auto pb-1 -mx-4 px-4">
      <div className="flex gap-2 min-w-max">
        {ALL_OPTIONS.map((role) => {
          const isActive = selected === role;
          return (
            <button
              key={role}
              onClick={() => onChange(role)}
              className={cn(
                'relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                isActive
                  ? 'bg-navy-900 dark:bg-blue-600 text-white border-transparent shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="officer-pill"
                  className="absolute inset-0 rounded-full bg-navy-900 dark:bg-blue-600 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {OFFICER_LABELS[role]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
