"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card as UiCard, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';
import { Task } from '@/types';

type TaskWithCard = Task & { card_title?: string | null };

function formatDateLabel(dateStr: string | null | undefined) {
  if (!dateStr) return 'Sem data';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return 'Sem data';
  }
}

const priorityColor: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const TasksCalendar: React.FC = () => {
  const [tasks, setTasks] = useState<TaskWithCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('id,text,completed,due_date,priority,card_id,cards(title)')
        .order('due_date', { ascending: true })
        .order('created_at', { ascending: true });

      setLoading(false);

      if (error) {
        toast.error('Erro ao carregar tarefas: ' + error.message);
        return;
      }

      const withCard: TaskWithCard[] = (data || []).map((t: any) => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        due_date: t.due_date,
        priority: t.priority,
        card_id: t.card_id,
        created_by: t.created_by,
        created_at: t.created_at,
        card_title: t.cards?.title ?? null,
      }));

      setTasks(withCard);
    };

    fetchTasks();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, TaskWithCard[]>();
    for (const t of tasks) {
      const key = t.due_date || 'no-date';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a === 'no-date' ? 1 : b === 'no-date' ? -1 : a.localeCompare(b)));
  }, [tasks]);

  return (
    <UiCard className="w-full">
      <CardHeader>
        <CardTitle>Tarefas (Calendário)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <p className="text-sm text-gray-500">Carregando...</p>}
        {!loading && grouped.length === 0 && <p className="text-sm text-gray-500">Nenhuma tarefa encontrada.</p>}
        {!loading &&
          grouped.map(([dateKey, items]) => (
            <div key={dateKey} className="border rounded-md p-3">
              <div className="mb-2 font-semibold text-gray-800">{formatDateLabel(dateKey === 'no-date' ? null : dateKey)}</div>
              <div className="space-y-2">
                {items.map((t) => (
                  <div key={t.id} className="flex items-start justify-between gap-3 bg-white rounded-md border p-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{t.text}</div>
                      <div className="text-xs text-gray-600">
                        {t.card_title ? `Card: ${t.card_title}` : 'Sem card associado'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={priorityColor[String(t.priority || 'low')] || priorityColor.low}>
                        {String(t.priority || 'low')}
                      </Badge>
                      {t.completed ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Concluída</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-700">Pendente</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </CardContent>
    </UiCard>
  );
};

export default TasksCalendar;