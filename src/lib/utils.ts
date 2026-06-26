import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isAfter, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm');
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'dd/MM/yy');
  } catch {
    return dateStr;
  }
}

export function isOverdue(dueDateStr?: string): boolean {
  if (!dueDateStr) return false;
  try {
    return isAfter(new Date(), parseISO(dueDateStr));
  } catch {
    return false;
  }
}

export function isCompletedThisWeek(completedAt?: string): boolean {
  if (!completedAt) return false;
  try {
    const completed = parseISO(completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return isAfter(completed, weekAgo);
  } catch {
    return false;
  }
}
