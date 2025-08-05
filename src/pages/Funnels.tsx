"use client";

import * as React from "react";
import { FunnelBoard } from "@/components/crm/FunnelBoard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateFunnelDialog } from "@/components/crm/CreateFunnelDialog";
import { CardDetailDialog } from "@/components/crm/CardDetailDialog";
import { CreateStageDialog } from "@/components/crm/CreateStageDialog";
import { Plus } from "lucide-react";

// Interfaces
interface Card {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  tasksCount?: number;
  tasksDoneCount?: number;
  stageId: string;
}

interface Stage {
  id: string;
  name: string;
  funnelId: string;
}

interface Funnel {
  id: string;
  name: string;
}

// Sample Data
const sampleFunnels: Funnel[] = [
  { id: "funnel-1", name: "Funil de Vendas" },
  { id: "funnel-2", name: "Funil de Marketing" },
];

const sampleStages: Stage[] = [
  { id: "stage-1", name: "Novo", funnelId: "funnel-1" },
  { id: "stage-2", name: "Contato Feito", funnelId: "funnel-1" },
  { id: "stage-3", name: "Proposta", funnelId: "funnel-1" },
  { id: "stage-4", name: "Fechado", funnelId: "funnel-1" },
  { id: "stage-5", name: "Lead", funnelId: "funnel-2" },
  { id: "stage-6", name: "MQL", funnelId: "funnel-2" },
  { id: "stage-7", name: "SQL", funnelId: "funnel-2" },
];

const sampleCards: Card[] = [
  { id: "card-1", title: "Contato João", description: "Interessado no produto X", assignedTo: "Maria", tasksCount: 3, tasksDoneCount: 1, stageId: "stage-1" },
  { id: "card-2", title: "Contato Ana", description: "Aguardando resposta", assignedTo: "Carlos", tasksCount: 2, tasksDoneCount: 2, stageId: "stage-2" },
  { id: "card-3", title: "Lead do Ebook", description: "Baixou o ebook de marketing", assignedTo: "Pedro", tasksCount: 1, tasksDoneCount: 0, stageId: "stage-5" },
];

const Funnels = () => {
  const [funnels, setFunnels] = React.useState<Funnel[]>(sampleFunnels);
  const [stages, setStages] = React.useState<Stage[]>(sampleStages);
  const [cards, setCards] = React.useState<Card[]>(sampleCards);
  const [selectedFunnelId, setSelectedFunnelId] = React.useState<string>(sampleFunnels[0]?.id || "");
  
  const [isCreateFunnelOpen, setCreateFunnelOpen] = React.useState(false);
  const [isCreateStageOpen, setCreateStageOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState<Card | null>(null);

  const { toast } = useToast();

  const handleCardMove = (cardId: string, newStageId: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, stageId: newStageId } : card
      )
    );
    toast({
      title: "Card movido",
      description: "O card foi movido para um novo estágio.",
    });
  };

  const handleCardClick = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setSelectedCard(card);
    }
  };

  const handleCreateFunnel = (funnelName: string, stageNames: string[]) => {
    const newFunnel: Funnel = {
      id: `funnel-${Date.now()}`,
      name: funnelName,
    };
    setFunnels((prev) => [...prev, newFunnel]);

    const newStages: Stage[] = stageNames.map((name, index) => ({
        id: `stage-${Date.now()}-${index}`,
        name: name,
        funnelId: newFunnel.id,
    }));
    setStages((prev) => [...prev, ...newStages]);

    setSelectedFunnelId(newFunnel.id);
    toast({
      title: "Funil criado!",
      description: `O funil "${funnelName}" foi criado com sucesso.`,
    });
  };

  const handleCreateStage = (stageName: string) => {
    if (!selectedFunnelId) return;

    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: stageName,
      funnelId: selectedFunnelId,
    };
    setStages((prev) => [...prev, newStage]);
    toast({
      title: "Estágio adicionado!",
      description: `O estágio "${stageName}" foi adicionado ao funil.`,
    });
  };

  const currentStages = stages.filter((stage) => stage.funnelId === selectedFunnelId);
  const currentStageIds = currentStages.map(stage => stage.id);
  const currentCards = cards.filter((card) => currentStageIds.includes(card.stageId));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Funis</h1>
        <div className="flex items-center gap-2">
          <Select value={selectedFunnelId} onValueChange={setSelectedFunnelId} disabled={funnels.length === 0}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione um funil" />
            </SelectTrigger>
            <SelectContent>
              {funnels.map((funnel) => (
                <SelectItem key={funnel.id} value={funnel.id}>
                  {funnel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedFunnelId && (
            <Button variant="outline" onClick={() => setCreateStageOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Estágio
            </Button>
          )}
          <Button onClick={() => setCreateFunnelOpen(true)}>Novo Funil</Button>
        </div>
      </div>

      {funnels.length > 0 && selectedFunnelId ? (
        <FunnelBoard
          stages={currentStages}
          cards={currentCards}
          onCardMove={handleCardMove}
          onCardClick={handleCardClick}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">Nenhum funil encontrado</h2>
            <p className="text-muted-foreground mt-2 mb-4">Crie seu primeiro funil para começar a organizar seus negócios.</p>
            <Button onClick={() => setCreateFunnelOpen(true)}>Criar Primeiro Funil</Button>
        </div>
      )}


      <CreateFunnelDialog
        isOpen={isCreateFunnelOpen}
        onOpenChange={setCreateFunnelOpen}
        onCreate={handleCreateFunnel}
      />

      <CreateStageDialog
        isOpen={isCreateStageOpen}
        onOpenChange={setCreateStageOpen}
        onCreate={handleCreateStage}
      />

      <CardDetailDialog
        isOpen={!!selectedCard}
        onOpenChange={(isOpen) => !isOpen && setSelectedCard(null)}
        card={selectedCard}
      />
    </div>
  );
};

export default Funnels;