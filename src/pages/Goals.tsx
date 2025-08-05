"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface GoalEntry {
  month: number;
  year: number;
  goal: number;
}

const Goals = () => {
  const { toast } = useToast();
  const [goalsHistory, setGoalsHistory] = usePersistentState<GoalEntry[]>('goals_history', []);
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentMonthGoal = goalsHistory.find(g => g.month === currentMonth && g.year === currentYear)?.goal || 0;
  const [inputValue, setInputValue] = React.useState<string>(currentMonthGoal.toString());

  React.useEffect(() => {
    const currentGoal = goalsHistory.find(g => g.month === currentMonth && g.year === currentYear)?.goal || 0;
    setInputValue(currentGoal.toString());
  }, [goalsHistory, currentMonth, currentYear]);

  const handleSave = () => {
    const newGoalValue = Number(inputValue);
    if (isNaN(newGoalValue) || newGoalValue < 0) {
      toast({
        title: "Valor Inválido",
        description: "Por favor, insira um número válido para a meta.",
        variant: "destructive",
      });
      return;
    }

    setGoalsHistory(prev => {
      const existingEntryIndex = prev.findIndex(g => g.month === currentMonth && g.year === currentYear);
      if (existingEntryIndex > -1) {
        const updatedHistory = [...prev];
        updatedHistory[existingEntryIndex] = { ...updatedHistory[existingEntryIndex], goal: newGoalValue };
        return updatedHistory;
      } else {
        return [...prev, { month: currentMonth, year: currentYear, goal: newGoalValue }];
      }
    });

    toast({
      title: "Meta Salva!",
      description: `A nova meta para ${now.toLocaleString('pt-BR', { month: 'long' })} é de R$ ${newGoalValue.toLocaleString('pt-BR')}.`,
    });
  };

  const formatMonthYear = (month: number, year: number) => {
    return new Date(year, month - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  }

  return (
    <>
      <Header title="Metas de Vendas" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meta Mensal de Receita</CardTitle>
            <CardDescription>
              Defina a meta de receita para o mês atual. O progresso será exibido no dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="goal">Meta para {formatMonthYear(currentMonth, currentYear)} (R$)</Label>
                <Input
                  id="goal"
                  type="number"
                  placeholder="Ex: 25000"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Salvar Meta</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Metas</CardTitle>
            <CardDescription>Metas definidas nos meses anteriores.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês/Ano</TableHead>
                  <TableHead className="text-right">Meta (R$)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goalsHistory.length > 0 ? (
                  goalsHistory
                    .slice()
                    .sort((a, b) => new Date(b.year, b.month).getTime() - new Date(a.year, a.month).getTime())
                    .map(({ month, year, goal }) => (
                      <TableRow key={`${year}-${month}`}>
                        <TableCell>{formatMonthYear(month, year)}</TableCell>
                        <TableCell className="text-right">{goal.toLocaleString('pt-BR')}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">Nenhum histórico de metas.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Goals;