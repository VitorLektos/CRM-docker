"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
  ComposedChart,
} from "recharts";
import { CardData, Stage } from "@/data/sample-data";

interface GoalEntry {
  month: number;
  year: number;
  goal: number;
}

interface GoalProgressChartProps {
  goalsHistory: GoalEntry[];
  cards: CardData[];
  stages: Stage[];
}

export function GoalProgressChart({ goalsHistory, cards, stages }: GoalProgressChartProps) {
  const chartData = React.useMemo(() => {
    const closedStageIds = stages.filter(s => s.name.toLowerCase() === 'fechado').map(s => s.id);
    
    const revenueByMonth: { [key: string]: number } = {};

    cards.forEach(card => {
      if (closedStageIds.includes(card.stageId)) {
        const closedEntry = card.history?.slice().reverse().find(h => h.description.includes("para 'Fechado'"));
        const date = new Date(closedEntry?.date || card.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        revenueByMonth[key] = (revenueByMonth[key] || 0) + (card.value || 0);
      }
    });

    const combinedData: { name: string; Meta: number; Alcançado: number }[] = [];
    const processedMonths = new Set<string>();

    goalsHistory.forEach(({ year, month, goal }) => {
      const key = `${year}-${String(month).padStart(2, '0')}`;
      const monthName = new Date(year, month - 1).toLocaleString('pt-BR', { month: 'short' });
      const name = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${String(year).slice(2)}`;
      
      combinedData.push({
        name,
        Meta: goal,
        Alcançado: revenueByMonth[key] || 0,
      });
      processedMonths.add(key);
    });

    Object.entries(revenueByMonth).forEach(([key, revenue]) => {
      if (!processedMonths.has(key)) {
        const [year, month] = key.split('-').map(Number);
        const monthName = new Date(year, month - 1).toLocaleString('pt-BR', { month: 'short' });
        const name = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${String(year).slice(2)}`;
        combinedData.push({
          name,
          Meta: 0,
          Alcançado: revenue,
        });
      }
    });

    return combinedData.sort((a, b) => a.name.localeCompare(b.name));

  }, [goalsHistory, cards, stages]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metas vs. Resultados</CardTitle>
        <CardDescription>Comparativo de metas mensais e receita alcançada.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
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
            <Bar dataKey="Alcançado" fill="hsl(var(--primary))" name="Alcançado" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="Meta" stroke="hsl(var(--foreground))" strokeWidth={2} name="Meta" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}