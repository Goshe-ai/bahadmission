import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { OFFICER_LABELS, OFFICER_ROLES_LIST } from '@/types';
import type { Task, TaskFormData, OfficerRole } from '@/types';
import { UrgencyPicker } from './UrgencyPicker';

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
  officer_role: 'katzin_haganash',
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
      ? { title: task.title, description: task.description ?? '', officer_role: task.officer_role, urgency: task.urgency, due_date: task.due_date ? task.due_date.slice(0, 16) : '', notes: task.notes ?? '' }
      : { ...EMPTY_FORM, officer_role: defaultOfficer ?? 'katzin_haganash' }
    );
  }, [task, defaultOfficer, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
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
                <label className={LABEL_CLS}>קצין אחראי</label>
                <select value={form.officer_role}
                  onChange={(e) => setForm({ ...form, officer_role: e.target.value as OfficerRole })}
                  className={INPUT_CLS}>
                  <option value="all">לכולם — משימה לכל הקצינים</option>
                  <option disabled>──────────────────────</option>
                  {OFFICER_ROLES_LIST.map((r) => <option key={r} value={r}>{OFFICER_LABELS[r]}</option>)}
                </select>
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
                <button type="submit" disabled={isSaving || !form.title.trim()}
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
