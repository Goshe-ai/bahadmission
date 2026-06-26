import { useState, useMemo } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { Plus, RefreshCw } from 'lucide-react';
import {
  useTasks, useCreateTask, useUpdateTask, useDeleteTask,
  useDuplicateTask, useAdvanceTaskStatus,
} from '@/hooks/useTasks';
import { useSelectedOfficer } from '@/hooks/useOfficers';
import { OfficerSelector } from '@/components/OfficerSelector';
import { Column } from '@/components/Column';
import { TaskModal } from '@/components/TaskModal';
import { TaskFilters, applyFilters } from '@/components/TaskFilters';
import { StatsCards } from '@/components/StatsCards';
import { DashboardHeader } from '@/components/DashboardHeader';
import { OFFICER_LABELS, OFFICER_ROLES_LIST } from '@/types';
import type { Task, TaskFormData, OfficerRole } from '@/types';
import { exportTasksToPdf } from '@/lib/exportPdf';
import type { FilterState } from '@/components/TaskFilters';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  urgencies: [],
  statusView: 'all',
  sortBy: 'urgency',
};

interface DashboardProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export function Dashboard({ darkMode, onToggleDark }: DashboardProps) {
  const { selected, setSelected } = useSelectedOfficer();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading, error, refetch } = useTasks(selected);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const duplicateTask = useDuplicateTask();
  const advanceStatus = useAdvanceTaskStatus();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filtered = useMemo(() => applyFilters(tasks, filters, selected), [tasks, filters, selected]);
  const openTasks = filtered.filter((t) => t.status !== 'done');
  const doneTasks = filtered.filter((t) => t.status === 'done');

  const handleSave = (data: TaskFormData) => {
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, ...data }, { onSuccess: () => closeModal() });
    } else {
      createTask.mutate(data, { onSuccess: () => closeModal() });
    }
  };

  const closeModal = () => { setModalOpen(false); setEditingTask(null); };
  const openEdit = (task: Task) => { setEditingTask(task); setModalOpen(true); };
  const openCreate = () => { setEditingTask(null); setModalOpen(true); };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const allOpen = filtered.filter((t) => t.status !== 'done');
    const oldIndex = allOpen.findIndex((t) => t.id === active.id);
    const newIndex = allOpen.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    arrayMove(allOpen, oldIndex, newIndex).forEach((task, idx) => {
      if (task.sort_order !== idx) updateTask.mutate({ id: task.id, sort_order: idx });
    });
  };

  const columnProps = {
    showOfficer: false,
    onEdit: openEdit,
    onAdvance: advanceStatus,
    onDuplicate: (t: Task) => duplicateTask.mutate(t),
    onDelete: (id: string) => deleteTask.mutate(id),
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
      <p className="text-sm">שגיאה בטעינת המשימות. בדוק את חיבור Supabase.</p>
      <button onClick={() => refetch()} className="flex items-center gap-2 text-xs text-blue-500 hover:underline">
        <RefreshCw className="w-3.5 h-3.5" /> נסה שוב
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-heebo" dir="rtl">
      <DashboardHeader darkMode={darkMode} onToggleDark={onToggleDark}
        onExportPdf={() => exportTasksToPdf(filtered, `משימות — ${selected === 'all' ? 'כולם' : OFFICER_LABELS[selected]}`)} />

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : (
          <StatsCards tasks={tasks} />
        )}

        <OfficerSelector selected={selected} onChange={setSelected} />
        <TaskFilters filters={filters} onChange={setFilters} />

        <button
          onClick={openCreate}
          className="flex items-center gap-2 w-full py-2.5 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          הוסף משימה חדשה
        </button>

        {selected === 'all' ? (
          <div className="space-y-6">
            {OFFICER_ROLES_LIST.map((role) => {
              const roleTasks = filtered.filter((t) => t.officer_role === role);
              if (roleTasks.length === 0) return null;
              return (
                <section key={role}>
                  <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                    {OFFICER_LABELS[role]} ({roleTasks.length})
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Column title="משימות פתוחות" tasks={roleTasks.filter((t) => t.status !== 'done')} {...columnProps} />
                    <Column title="הושלמו" tasks={roleTasks.filter((t) => t.status === 'done')} {...columnProps} />
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid md:grid-cols-2 gap-4">
              <SortableContext items={openTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <Column title={`משימות פתוחות (${openTasks.length})`} tasks={openTasks} isLoading={isLoading} {...columnProps} />
              </SortableContext>
              <Column title={`הושלמו (${doneTasks.length})`} tasks={doneTasks} isLoading={isLoading} {...columnProps} />
            </div>
          </DndContext>
        )}
      </main>

      <TaskModal
        open={modalOpen}
        task={editingTask}
        defaultOfficer={selected !== 'all' ? (selected as Exclude<OfficerRole, 'all'>) : undefined}
        onClose={closeModal}
        onSave={handleSave}
        isSaving={createTask.isPending || updateTask.isPending}
      />
    </div>
  );
}
