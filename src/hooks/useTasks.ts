import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import type { Task, TaskFormData, OfficerRole, TaskStatus } from '@/types';

const QUERY_KEY = 'tasks';

export function useTasks(officerFilter: OfficerRole) {
  return useQuery({
    queryKey: [QUERY_KEY, officerFilter],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (officerFilter !== 'all') {
        query = query.eq('officer_role', officerFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Task[];
    },
    staleTime: 30_000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: TaskFormData) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: formData.title,
          description: formData.description || undefined,
          officer_role: formData.officer_role,
          urgency: formData.urgency,
          status: 'pending' as TaskStatus,
          due_date: formData.due_date || undefined,
          notes: formData.notes || undefined,
          sort_order: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onMutate: async (formData) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });
      const optimistic: Task = {
        id: crypto.randomUUID(),
        title: formData.title,
        description: formData.description || undefined,
        officer_role: formData.officer_role,
        urgency: formData.urgency,
        status: 'pending',
        due_date: formData.due_date || undefined,
        notes: formData.notes || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sort_order: 0,
      };
      queryClient.setQueriesData<Task[]>({ queryKey: [QUERY_KEY] }, (old) =>
        old ? [optimistic, ...old] : [optimistic]
      );
      return { optimistic };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.optimistic) {
        queryClient.setQueriesData<Task[]>({ queryKey: [QUERY_KEY] }, (old) =>
          old?.filter((t) => t.id !== ctx.optimistic.id) ?? []
        );
      }
      toast.error('שגיאה ביצירת המשימה');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('משימה נוצרה בהצלחה');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });
      const snapshot = queryClient.getQueriesData<Task[]>({ queryKey: [QUERY_KEY] });
      queryClient.setQueriesData<Task[]>({ queryKey: [QUERY_KEY] }, (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...updates } : t)) ?? []
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        ctx.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
      toast.error('שגיאה בעדכון המשימה');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('משימה עודכנה');
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });
      const snapshot = queryClient.getQueriesData<Task[]>({ queryKey: [QUERY_KEY] });
      queryClient.setQueriesData<Task[]>({ queryKey: [QUERY_KEY] }, (old) =>
        old?.filter((t) => t.id !== id) ?? []
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        ctx.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
      toast.error('שגיאה במחיקת המשימה');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('משימה נמחקה');
    },
  });
}

export function useDuplicateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: `${task.title} (עותק)`,
          description: task.description,
          officer_role: task.officer_role,
          urgency: task.urgency,
          status: 'pending' as TaskStatus,
          due_date: task.due_date,
          notes: task.notes,
          sort_order: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('משימה שוכפלה');
    },
    onError: () => toast.error('שגיאה בשכפול המשימה'),
  });
}

export function useAdvanceTaskStatus() {
  const updateTask = useUpdateTask();

  return (task: Task) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      pending: 'in_progress',
      in_progress: 'done',
      done: 'pending',
    };

    const updates: Partial<Task> = { status: nextStatus[task.status] };
    if (nextStatus[task.status] === 'done') {
      updates.completed_at = new Date().toISOString();
    } else if (task.status === 'done') {
      updates.completed_at = undefined;
    }

    updateTask.mutate({ id: task.id, ...updates });
  };
}
