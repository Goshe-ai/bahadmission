export type OfficerRole =
  | 'katzin_haganash'
  | 'kamatz'
  | 'kachum'
  | 'kaar'
  | 'samaf'
  | 'kadat'
  | 'kasimulatzyot'
  | 'kaimunim'
  | 'kalap'
  | 'kahad'
  | 'kabat'
  | 'kamabatz'
  | 'kaag'
  | 'all';

export interface TaskConfirmation {
  id: string;
  task_id: string;
  officer_role: Exclude<OfficerRole, 'all'>;
  confirmed_at: string;
}

export const OFFICER_LABELS: Record<OfficerRole, string> = {
  katzin_haganash: 'ק. הגנ"ש',
  kamatz: 'קמ"צ',
  kachum: 'קחו"ם',
  kaar: 'קא"ר',
  samaf: 'סמ"פ',
  kadat: 'ק.דת',
  kasimulatzyot: 'ק.סימולציות',
  kaimunim: 'ק.אימונים',
  kalap: 'קל"פ',
  kahad: 'קה"ד',
  kabat: 'קב"ט',
  kamabatz: 'קמב"צ',
  kaag: 'קא"ג',
  all: 'כולם',
};

export const OFFICER_ROLES_LIST: Exclude<OfficerRole, 'all'>[] = [
  'katzin_haganash',
  'kamatz',
  'kachum',
  'kaar',
  'samaf',
  'kadat',
  'kasimulatzyot',
  'kaimunim',
  'kalap',
  'kahad',
  'kabat',
  'kamabatz',
  'kaag',
];

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'דחוף מאוד', color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-400' },
  high:     { label: 'דחוף',      color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-400' },
  medium:   { label: 'רגיל',      color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-400' },
  low:      { label: 'נמוך',      color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-400' },
};

export const URGENCY_STRIP: Record<UrgencyLevel, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-yellow-400',
  low:      'bg-green-500',
};

export type TaskStatus = 'pending' | 'in_progress' | 'done';

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  pending:     { label: 'ממתין',     color: 'text-slate-600',  bg: 'bg-slate-100' },
  in_progress: { label: 'בביצוע',   color: 'text-blue-700',   bg: 'bg-blue-100' },
  done:        { label: 'הושלם',    color: 'text-emerald-700', bg: 'bg-emerald-100' },
};

export interface Task {
  id: string;
  title: string;
  description?: string;
  officer_role: OfficerRole;   // legacy single-officer column; always equals officer_roles[0]
  officer_roles: OfficerRole[];
  urgency: UrgencyLevel;
  status: TaskStatus;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  sort_order?: number;
  confirmations?: TaskConfirmation[];
}

export interface TaskFormData {
  title: string;
  description: string;
  officer_roles: OfficerRole[];
  urgency: UrgencyLevel;
  due_date: string;
  notes: string;
}
