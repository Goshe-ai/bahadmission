import { Moon, Sun, Download } from 'lucide-react';

interface DashboardHeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  onExportPdf: () => void;
}

export function DashboardHeader({ darkMode, onToggleDark, onExportPdf }: DashboardHeaderProps) {
  return (
    <header className="bg-navy-900 dark:bg-slate-900 text-white shadow-lg sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onToggleDark} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="מצב כהה/בהיר">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            ייצא PDF
          </button>
        </div>
        <div className="text-right">
          <h1 className="text-lg font-bold">מנהל משימות</h1>
          <p className="text-xs text-slate-300 font-light">קורס קציני — סמ&quot;פ</p>
        </div>
      </div>
    </header>
  );
}
