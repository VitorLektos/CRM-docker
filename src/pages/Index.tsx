"use client";

import * as React from "react";
import { FunnelBoard } from "@/components/crm/FunnelBoard";
import { ContactForm } from "@/components/crm/ContactForm";
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

const Index = () => {
  const [cards, setCards] = React.useState(sampleCards);
  const toast = useToast();

  const handleCardMove = (cardId: string, newStageId: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, stageId: newStageId } : card,
      ),
    );
    toast.toast({
      title: "Card movido",
      description: `O card foi movido para o estágio ${newStageId}`,
    });
  };

  const handleCardClick = (cardId: string) => {
    toast.toast({
      title: "Card selecionado",
      description: `Você clicou no card ${cardId}`,
    });
  };

  const handleContactSubmit = (data: any) => {
    toast.toast({
      title: "Contato salvo",
      description: `Contato ${data.name} salvo com sucesso!`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">CRM - Funil de Vendas</h1>
      <FunnelBoard stages={sampleStages} cards={cards} onCardMove={handleCardMove} onCardClick={handleCardClick} />
      <div className="mt-10 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Cadastrar Contato</h2>
        <ContactForm onSubmit={handleContactSubmit} />
      </div>
    </div>
  );
};

export default Index;