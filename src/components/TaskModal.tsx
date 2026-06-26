import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users } from 'lucide-react';
import { OFFICER_LABELS, OFFICER_ROLES_LIST } from '@/types';
import type { Task, TaskFormData, OfficerRole } from '@/types';
import { UrgencyPicker } from './UrgencyPicker';
import { cn } from '@/lib/utils';

interface TaskModalProps {
  open: boolean;
  task?: Task | null;
  defaultOfficer?: Exclude<OfficerRole, 'all'>;
  onClose: () => void;
  onSave: (data: TaskFormData) => void;
  isSaving?: boolean;
}

const EMPTY_FORM: TaskFormData = {
  title: '',
  description: '',
  officer_roles: ['katzin_haganash'],
  urgency: 'medium',
  due_date: '',
  notes: '',
};

const INPUT_CLS = 'w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-right placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500';
const LABEL_CLS = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-right';

export function TaskModal({ open, task, defaultOfficer, onClose, onSave, isSaving }: TaskModalProps) {
  const [form, setForm] = useState<TaskFormData>(EMPTY_FORM);

  useEffect(() => {
    setForm(task
      ? {
          title: task.title,
          description: task.description ?? '',
          officer_roles: task.officer_roles,
          urgency: task.urgency,
          due_date: task.due_date ? task.due_date.slice(0, 16) : '',
          notes: task.notes ?? '',
        }
      : { ...EMPTY_FORM, officer_roles: defaultOfficer ? [defaultOfficer] : ['katzin_haganash'] }
    );
  }, [task, defaultOfficer, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || form.officer_roles.length === 0) return;
    onSave(form);
  };

  const isAll = form.officer_roles.includes('all');

  const toggleAll = () => {
    setForm({ ...form, officer_roles: isAll ? ['katzin_haganash'] : ['all'] });
  };

  const toggleOfficer = (role: Exclude<OfficerRole, 'all'>) => {
    const current = form.officer_roles.filter(r => r !== 'all') as Exclude<OfficerRole, 'all'>[];
    const idx = current.indexOf(role);
    if (idx === -1) {
      setForm({ ...form, officer_roles: [...current, role] });
    } else {
      const next = current.filter(r => r !== role);
      if (next.length > 0) setForm({ ...form, officer_roles: next });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-x-4 top-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[520px] z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl z-10">
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {task ? 'עריכת משימה' : 'משימה חדשה'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
              <div>
                <label className={LABEL_CLS}>כותרת <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required placeholder="הכנס כותרת משימה..." className={INPUT_CLS} />
              </div>

              <div>
                <label className={LABEL_CLS}>תיאור</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="תיאור המשימה (אופציונלי)..." rows={3} className={`${INPUT_CLS} resize-none`} />
              </div>

              <div>
                <label className={LABEL_CLS}>קצינים אחראים</label>

                {/* לכולם toggle */}
                <button
                  type="button"
                  onClick={toggleAll}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border mb-2 transition-colors',
                    isAll
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    לכולם
                  </span>
                  <span className="text-xs opacity-70">כל הקצינים יצטרכו לאשר</span>
                </button>

                {/* individual officers grid */}
                {!isAll && (
                  <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto p-0.5">
                    {OFFICER_ROLES_LIST.map((r) => {
                      const checked = form.officer_roles.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleOfficer(r)}
                          className={cn(
                            'flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg border text-right transition-colors',
                            checked
                              ? 'bg-navy-900 border-navy-900 text-white dark:bg-blue-600 dark:border-blue-600'
                              : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          )}
                        >
                          <span className={cn(
                            'w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                            checked ? 'bg-white border-white' : 'border-slate-400 dark:border-slate-500'
                          )}>
                            {checked && <span className="w-1.5 h-1.5 bg-navy-900 dark:bg-blue-600 rounded-sm" />}
                          </span>
                          {OFFICER_LABELS[r]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className={LABEL_CLS}>רמת דחיפות</label>
                <UrgencyPicker value={form.urgency} onChange={(u) => setForm({ ...form, urgency: u })} />
              </div>

              <div>
                <label className={LABEL_CLS}>תאריך יעד</label>
                <input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className={LABEL_CLS}>הערות</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="הערות נוספות..." rows={2} className={`${INPUT_CLS} resize-none`} />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  ביטול
                </button>
                <button type="submit" disabled={isSaving || !form.title.trim() || form.officer_roles.length === 0}
                  className="flex-1 py-2 text-sm font-semibold text-white bg-navy-900 dark:bg-blue-600 rounded-lg hover:bg-slate-700 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? 'שומר...' : task ? 'עדכן' : 'צור משימה'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
