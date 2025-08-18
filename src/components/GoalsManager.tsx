"use client";

import React, { useEffect, useState } from 'react';
import { Card as UiCard, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';
import { Goal } from '@/types';

const monthNames = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const GoalsManager: React.FC = () => {
  const now = new Date();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [amount, setAmount] = useState<string>('');

  const fetchGoals = async () => {
    const { data, error } = await supabase.from('goals').select('*').order('year', { ascending: false }).order('month', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar metas: ' + error.message);
      return;
    }
    setGoals(data || []);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const createGoal = async () => {
    const goal_amount = Number(amount);
    if (!month || !year || isNaN(goal_amount) || goal_amount <= 0) {
      toast.error('Preencha mês, ano e valor da meta corretamente.');
      return;
    }

    const { data, error } = await supabase.from('goals').insert({ month, year, goal_amount }).select();
    if (error) {
      toast.error('Erro ao criar meta: ' + error.message);
      return;
    }
    toast.success('Meta criada com sucesso!');
    setAmount('');
    if (data && data.length > 0) setGoals((prev) => [data[0], ...prev]);
  };

  return (
    <UiCard className="w-full">
      <CardHeader>
        <CardTitle>Metas (Goals)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <Label>Mês</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="year">Ano</Label>
            <Input id="year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="amount">Meta (valor)</Label>
            <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex.: 10000" />
          </div>
          <div className="flex items-end">
            <Button onClick={createGoal} className="w-full">Cadastrar</Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">Metas recentes</div>
          {goals.length === 0 && <p className="text-sm text-gray-500">Nenhuma meta cadastrada.</p>}
          {goals.map((g) => (
            <div key={`${g.year}-${g.month}`} className="flex items-center justify-between border rounded-md p-2">
              <div className="text-sm">
                <span className="font-medium">{monthNames.find(m => m.value === g.month)?.label}</span> / {g.year}
              </div>
              <div className="text-sm font-semibold">R$ {Number(g.goal_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </UiCard>
  );
};

export default GoalsManager;