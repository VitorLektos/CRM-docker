"use client";

import * as React from "react";
import { FunnelBoard } from "@/components/crm/FunnelBoard";
import { useToast } from "@/hooks/use-toast";

const sampleStages = [
  { id: "stage-1", name: "Novo" },
  { id: "stage-2", name: "Contato Feito" },
  { id: "stage-3", name: "Proposta" },
  { id: "stage-4", name: "Fechado" },
];

const sampleCards = [
  {
    id: "card-1",
    title: "Contato João",
    description: "Interessado no produto X",
    assignedTo: "Maria",
    tasksCount: 3,
    tasksDoneCount: 1,
    stageId: "stage-1",
  },
  {
    id: "card-2",
    title: "Contato Ana",
    description: "Aguardando resposta",
    assignedTo: "Carlos",
    tasksCount: 2,
    tasksDoneCount: 2,
    stageId: "stage-2",
  },
];

const Funnels = () => {
  const [cards, setCards] = React.useState(sampleCards);
  const { toast } = useToast();

  const handleCardMove = (cardId: string, newStageId: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, stageId: newStageId } : card,
      ),
    );
    toast({
      title: "Card movido",
      description: `O card foi movido para um novo estágio.`,
    });
  };

  const handleCardClick = (cardId: string) => {
    toast({
      title: "Card selecionado",
      description: `Você clicou no card ${cardId}`,
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Funil de Vendas</h1>
      <FunnelBoard stages={sampleStages} cards={cards} onCardMove={handleCardMove} onCardClick={handleCardClick} />
    </div>
  );
};

export default Funnels;