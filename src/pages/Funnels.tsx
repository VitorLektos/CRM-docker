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
import { EditFunnelDialog } from "@/components/crm/EditFunnelDialog";
import { DeleteFunnelDialog } from "@/components/crm/DeleteFunnelDialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";

// Interfaces
interface CardData {
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

const sampleCards: CardData[] = [
  { id: "card-1", title: "Contato João", description: "Interessado no produto X", assignedTo: "Maria", tasksCount: 3, tasksDoneCount: 1, stageId: "stage-1" },
  { id: "card-2", title: "Contato Ana", description: "Aguardando resposta", assignedTo: "Carlos", tasksCount: 2, tasksDoneCount: 2, stageId: "stage-2" },
  { id: "card-3", title: "Lead do Ebook", description: "Baixou o ebook de marketing", assignedTo: "Pedro", tasksCount: 1, tasksDoneCount: 0, stageId: "stage-5" },
];

const Funnels = () => {
  const [funnels, setFunnels] = React.useState<Funnel[]>(sampleFunnels);
  const [stages, setStages] = React.useState<Stage[]>(sampleStages);
  const [cards, setCards] = React.useState<CardData[]>(sampleCards);
  const [selectedFunnelId, setSelectedFunnelId] = React.useState<string>(sampleFunnels[0]?.id || "");
  
  const [isCreateFunnelOpen, setCreateFunnelOpen] = React.useState(false);
  const [isCreateStageOpen, setCreateStageOpen] = React.useState(false);
  const [isEditFunnelOpen, setEditFunnelOpen] = React.useState(false);
  const [isDeleteFunnelOpen, setDeleteFunnelOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState<CardData | null>(null);

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

  const handleSaveFunnel = (funnelId: string, newName: string, newStageNames: string[]) => {
    setFunnels(prev => prev.map(f => f.id === funnelId ? { ...f, name: newName } : f));

    const existingStages = stages.filter(s => s.funnelId === funnelId);
    const newStages: Stage[] = [];
    const updatedStages: Stage[] = [];

    newStageNames.forEach(name => {
      const existing = existingStages.find(s => s.name === name);
      if (existing) {
        updatedStages.push(existing);
      } else {
        newStages.push({
          id: `stage-${Date.now()}-${Math.random()}`,
          name: name,
          funnelId: funnelId,
        });
      }
    });

    setStages(prev => [
      ...prev.filter(s => s.funnelId !== funnelId),
      ...updatedStages,
      ...newStages,
    ]);

    toast({
      title: "Funil atualizado!",
      description: `O funil "${newName}" foi salvo com sucesso.`,
    });
  };

  const handleDeleteFunnel = () => {
    if (!selectedFunnelId) return;

    const funnelToDelete = funnels.find(f => f.id === selectedFunnelId);
    if (!funnelToDelete) return;

    const updatedFunnels = funnels.filter(f => f.id !== selectedFunnelId);
    setFunnels(updatedFunnels);

    const associatedStageIds = stages.filter(s => s.funnelId === selectedFunnelId).map(s => s.id);
    setStages(prev => prev.filter(s => s.funnelId !== selectedFunnelId));

    setCards(prev => prev.filter(c => !associatedStageIds.includes(c.stageId)));

    setSelectedFunnelId(updatedFunnels[0]?.id || "");

    toast({
      title: "Funil excluído!",
      description: `O funil "${funnelToDelete.name}" foi excluído.`,
      variant: "destructive",
    });

    setDeleteFunnelOpen(false);
  };

  const selectedFunnel = funnels.find(f => f.id === selectedFunnelId) || null;
  const currentStages = stages.filter((stage) => stage.funnelId === selectedFunnelId);
  const currentCards = cards.filter((card) => currentStages.map(s => s.id).includes(card.stageId));

  return (
    <>
      <Header title="Funis">
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
            <>
              <Button variant="outline" size="icon" onClick={() => setEditFunnelOpen(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => setDeleteFunnelOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCreateStageOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Estágio
              </Button>
            </>
          )}
          <Button onClick={() => setCreateFunnelOpen(true)}>Novo Funil</Button>
        </div>
      </Header>

      {funnels.length > 0 && selectedFunnelId ? (
        <FunnelBoard
          stages={currentStages}
          cards={currentCards}
          onCardMove={handleCardMove}
          onCardClick={handleCardClick}
        />
      ) : (
        <Card className="flex flex-col items-center justify-center text-center p-10">
            <h2 className="text-xl font-semibold">Nenhum funil encontrado</h2>
            <p className="text-muted-foreground mt-2 mb-4">Crie seu primeiro funil para começar a organizar seus negócios.</p>
            <Button onClick={() => setCreateFunnelOpen(true)}>Criar Primeiro Funil</Button>
        </Card>
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

      <EditFunnelDialog
        isOpen={isEditFunnelOpen}
        onOpenChange={setEditFunnelOpen}
        funnel={selectedFunnel}
        initialStages={currentStages.map(s => s.name)}
        onSave={handleSaveFunnel}
      />

      <DeleteFunnelDialog
        isOpen={isDeleteFunnelOpen}
        onOpenChange={setDeleteFunnelOpen}
        onConfirm={handleDeleteFunnel}
      />

      <CardDetailDialog
        isOpen={!!selectedCard}
        onOpenChange={(isOpen) => !isOpen && setSelectedCard(null)}
        card={selectedCard}
      />
    </>
  );
};

export default Funnels;