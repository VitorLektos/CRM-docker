"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { GoalGauge } from "@/components/dashboard/GoalGauge";
import { sampleCards, sampleStages, type CardData, type Stage } from "@/data/sample-data";

const monthlyActivityData = [
  { month: "Jan", contatos: 65, negocios: 28 },
  { month: "Fev", contatos: 59, negocios: 48 },
  { month: "Mar", contatos: 80, negocios: 40 },
  { month: "Abr", contatos: 81, negocios: 19 },
  { month: "Mai", contatos: 56, negocios: 86 },
  { month: "Jun", contatos: 55, negocios: 27 },
];

const monthlyRevenueData = [
    { month: "Jan", receita: 4000 },
    { month: "Fev", receita: 3000 },
    { month: "Mar", receita: 5000 },
    { month: "Abr", receita: 4500 },
    { month: "Mai", receita: 6000 },
    { month: "Jun", receita: 5500 },
];

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = React.useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setState];
};

const Dashboard = () => {
  const [goal] = usePersistentState<number>('monthly_goal', 10000);
  const [cards] = usePersistentState<CardData[]>("cards_data", sampleCards);
  const [stages] = usePersistentState<Stage[]>("stages_data", sampleStages);

  const {
    currentRevenue,
    activeLeads,
    wonLeads,
    leadsWithoutTasks,
    leadSources,
    pendingTasks,
  } = React.useMemo(() => {
    const closedStageIds = stages.filter(s => s.name.toLowerCase() === 'fechado').map(s => s.id);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const closedCardsThisMonth = cards.filter(card => {
      if (!closedStageIds.includes(card.stageId)) return false;
      const currentStageName = stages.find(s => s.id === card.stageId)?.name;
      if (!currentStageName) return false;
      const closedEntry = card.history?.slice().reverse().find(h => h.description.includes(`para '${currentStageName}'`));
      const relevantDateStr = closedEntry?.date || card.createdAt;
      const relevantDate = new Date(relevantDateStr);
      return relevantDate.getMonth() === currentMonth && relevantDate.getFullYear() === currentYear;
    });

    const _currentRevenue = closedCardsThisMonth.reduce((sum, card) => sum + (card.value || 0), 0);
    const _activeLeads = cards.filter(card => !closedStageIds.includes(card.stageId)).length;
    const _wonLeads = cards.filter(card => closedStageIds.includes(card.stageId)).length;
    const _leadsWithoutTasks = cards.filter(card => !card.tasks || card.tasks.length === 0).length;
    const _pendingTasks = cards.reduce((total, card) => {
        const incompleteTasks = card.tasks?.filter(task => !task.completed).length || 0;
        return total + incompleteTasks;
    }, 0);

    const sources: { [key: string]: number } = {};
    cards.forEach(card => {
      const source = card.source || "Não informado";
      if (sources[source]) {
        sources[source]++;
      } else {
        sources[source] = 1;
      }
    });
    const _leadSources = Object.entries(sources)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      currentRevenue: _currentRevenue,
      activeLeads: _activeLeads,
      wonLeads: _wonLeads,
      leadsWithoutTasks: _leadsWithoutTasks,
      leadSources: _leadSources,
      pendingTasks: _pendingTasks,
    };
  }, [cards, stages]);

  return (
    <>
      <Header title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
            <GoalGauge value={currentRevenue} goal={goal} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Receita do Mês</CardTitle>
            <CardDescription>Total faturado</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leads Ativos</CardTitle>
            <CardDescription>Negócios em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{activeLeads}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Leads Ganhos</CardTitle>
            <CardDescription>Total de negócios fechados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{wonLeads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tarefas Pendentes</CardTitle>
            <CardDescription>Total de tarefas a fazer</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{pendingTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leads sem Tarefas</CardTitle>
            <CardDescription>Oportunidades sem ações</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{leadsWithoutTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fontes de Leads</CardTitle>
            <CardDescription>Principais canais de origem</CardDescription>
          </CardHeader>
          <CardContent>
            {leadSources.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {leadSources.map(([source, count]) => (
                  <li key={source} className="flex justify-between">
                    <span>{source}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma fonte registrada.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Mensal</CardTitle>
            <CardDescription>Novos contatos vs. Negócios fechados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyActivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend iconSize={10} wrapperStyle={{fontSize: "14px"}} />
                <Bar dataKey="contatos" fill="hsl(var(--primary))" name="Contatos" radius={[4, 4, 0, 0]} />
                <Bar dataKey="negocios" fill="hsl(var(--foreground))" name="Negócios" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
            <CardDescription>Evolução da receita nos últimos meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `R$${Number(value) / 1000}k`} />
                <Tooltip
                  formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend iconSize={10} wrapperStyle={{fontSize: "14px"}} />
                <Line type="monotone" dataKey="receita" name="Receita" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;