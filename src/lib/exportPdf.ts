import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OFFICER_LABELS, URGENCY_CONFIG, STATUS_CONFIG } from '@/types';
import type { Task } from '@/types';
import { formatDate } from './utils';

export function exportTasksToPdf(tasks: Task[], title: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 105, 15, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString('he-IL')}`, 105, 22, { align: 'center' });

  const rows = tasks.map((t) => [
    t.title,
    OFFICER_LABELS[t.officer_role],
    URGENCY_CONFIG[t.urgency].label,
    STATUS_CONFIG[t.status].label,
    t.due_date ? formatDate(t.due_date) : '—',
    t.description?.slice(0, 60) ?? '—',
  ]);

  autoTable(doc, {
    head: [['כותרת', 'קצין', 'דחיפות', 'סטטוס', 'תאריך יעד', 'תיאור']],
    body: rows,
    startY: 28,
    styles: { font: 'helvetica', fontSize: 8, halign: 'right', cellPadding: 2 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`tasks-${new Date().toISOString().slice(0, 10)}.pdf`);
}
