"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

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

const Goals = () => {
  const { toast } = useToast();
  const [goal, setGoal] = usePersistentState<number>('monthly_goal', 10000);
  const [inputValue, setInputValue] = React.useState<string>(goal.toString());

  React.useEffect(() => {
    setInputValue(goal.toString());
  }, [goal]);

  const handleSave = () => {
    const newGoal = Number(inputValue);
    if (!isNaN(newGoal) && newGoal >= 0) {
      setGoal(newGoal);
      toast({
        title: "Meta Salva!",
        description: `A nova meta mensal é de R$ ${newGoal.toLocaleString('pt-BR')}.`,
      });
    } else {
      toast({
        title: "Valor Inválido",
        description: "Por favor, insira um número válido para a meta.",
        variant: "destructive",
      });
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
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>Salvar Meta</Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default Goals;