"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const Goals = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [goal, setGoal] = React.useState<number>(0);
  const [inputValue, setInputValue] = React.useState<string>("0");
  const [loading, setLoading] = React.useState(true);
  const [goalId, setGoalId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchGoal = async () => {
      setLoading(true);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const { data, error } = await supabase
        .from("goals")
        .select("id, goal_amount")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .single();

      if (data) {
        setGoal(data.goal_amount);
        setInputValue(data.goal_amount.toString());
        setGoalId(data.id);
      } else if (error && error.code !== 'PGRST116') { // PGRST116 is 'single row not found'
        toast({ title: "Erro ao buscar meta", description: error.message, variant: "destructive" });
      }
      setLoading(false);
    };
    fetchGoal();
  }, [toast]);

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado para salvar a meta.", variant: "destructive" });
      return;
    }

    const newGoal = Number(inputValue);
    if (isNaN(newGoal) || newGoal < 0) {
      toast({ title: "Valor Inválido", description: "Por favor, insira um número válido para a meta.", variant: "destructive" });
      return;
    }

    const now = new Date();
    const goalData = {
      id: goalId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      goal_amount: newGoal,
      set_by: user.id,
    };

    const { error } = await supabase.from("goals").upsert(goalData, { onConflict: 'id' });

    if (error) {
      toast({ title: "Erro ao salvar meta", description: error.message, variant: "destructive" });
    } else {
      setGoal(newGoal);
      toast({ title: "Meta Salva!", description: `A nova meta mensal é de ${newGoal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.` });
    }
  };

  return (
    <>
      <Header title="Metas de Vendas" />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Meta Mensal de Receita</CardTitle>
          <CardDescription>
            Defina a meta de receita para o mês atual. O progresso será exibido no dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="goal">Meta (R$)</Label>
                <Input
                  id="goal"
                  type="number"
                  placeholder="Ex: 25000"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={loading}>Salvar Meta</Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default Goals;