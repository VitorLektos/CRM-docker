"use client";

import * as React from "react";
import { FunnelBoard } from "@/components/crm/FunnelBoard";
import { FunnelListView } from "@/components/crm/FunnelListView";
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
import { CardFormDialog } from "@/components/crm/CardFormDialog";
import { CreateStageDialog } from "@/components/crm/CreateStageDialog";
import { EditFunnelDialog } from "@/components/crm/EditFunnelDialog";
import { DeleteFunnelDialog } from "@/components/crm/DeleteFunnelDialog";
import { FunnelViewToggle } from "@/components/crm/FunnelViewToggle";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { 
  sampleContacts, 
  stageColorStyles, 
  sampleFunnels, 
  sampleStages, 
  sampleCards,
  type Contact,
  type CardData,
  type Stage,
  type Funnel,
  type HistoryEntry
} from "@/data/sample-data";

const Funnels = () => {
  const [funnels, setFunnels] = React.useState<Funnel[]>(sampleFunnels);
  const [stages, setStages] = React.useState<Stage[]>(sampleStages);
  const [cards, setCards] = React.useState<CardData[]>(sampleCards);
  const [contacts] = React.useState<Contact[]>(sampleContacts);
  const [selectedFunnelId, setSelectedFunnelId] = React.useState<string>(sampleFunnels[0]?.id || "");
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');
  
  const [isCreateFunnelOpen, setCreateFunnelOpen] = React.useState(false);
  const [isCreateStageOpen, setCreateStageOpen] = React.useState(false);
  const [isEditFunnelOpen, setEditFunnelOpen] = React.useState(false);
  const [isDeleteFunnelOpen, setDeleteFunnelOpen] = React.useState(false);
  const [isCardFormOpen, setCardFormOpen] = React.useState(false);
  const [currentCard, setCurrentCard] = React.useState<Partial<CardData> | null>(null);

  const { toast } = useToast();

  const addHistoryEntry = (card: CardData, description: string): CardData => {
    const newEntry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString(),
      description,
    };
    return { ...card, history: [...(card.history || []), newEntry] };
  };

  const handleCardMove = (cardId: string, newStageId: string) => {
    const cardToMove = cards.find(c => c.id === cardId);
    if (!cardToMove || cardToMove.stageId === newStageId) return;

    const oldStage = stages.find(s => s.id === cardToMove.stageId);
    const newStage = stages.find(s => s.id === newStageId);
    if (!oldStage || !newStage) return;

    const updatedCard = addHistoryEntry(cardToMove, `Movido de '${oldStage.name}' para '${newStage.name}'.`);
    
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...updatedCard, stageId: newStageId } : card
      )
    );
    toast({
      title: "Card movido",
      description: `O card foi movido para ${newStage.name}.`,
    });
  };

  const handleCardClick = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setCurrentCard(card);
      setCardFormOpen(true);
    }
  };

  const handleNewCardClick = () => {
    setCurrentCard({ 
      stageId: currentStages[0]?.id || "", 
      tasks: [], 
      history: [],
      companyName: "",
      businessType: "",
    });
    setCardFormOpen(true);
  };

  const handleSaveCard = (data: any, initialData: any) => {
    const cardData = {
      ...initialData,
      ...data,
      tasks: data.tasks?.map((t: any) => ({...t, dueDate: t.dueDate?.toISOString()})) || []
    };

    if (cardData.id) { // Update existing card
      const updatedCard = addHistoryEntry(cardData, 'Card atualizado.');
      setCards(cards.map(c => c.id === cardData.id ? updatedCard : c));
      toast({ title: "Card atualizado!", description: `O card "${cardData.title}" foi salvo.` });
    } else { // Create new card
      const newCard: CardData = { 
        ...cardData, 
        id: `card-${Date.now()}`,
        createdAt: new Date().toISOString(),
        history: [{ id: `hist-${Date.now()}`, date: new Date().toISOString(), description: 'Card criado.' }]
      };
      setCards([...cards, newCard]);
      toast({ title: "Card criado!", description: `O card "${newCard.title}" foi adicionado.` });
    }
    setCardFormOpen(false);
    setCurrentCard(null);
  };

  const handleCreateFunnel = (funnelName: string, stageNames: string[]) => {
    const newFunnel: Funnel = { id: `funnel-${Date.now()}`, name: funnelName };
    setFunnels((prev) => [...prev, newFunnel]);

    const newStages: Stage[] = stageNames.map((name, index) => ({
        id: `stage-${Date.now()}-${index}`,
        name: name,
        funnelId: newFunnel.id,
        color: stageColorStyles[index % stageColorStyles.length],
    }));
    setStages((prev) => [...prev, ...newStages]);

    setSelectedFunnelId(newFunnel.id);
    toast({ title: "Funil criado!", description: `O funil "${funnelName}" foi criado.` });
  };

  const handleCreateStage = (stageName: string) => {
    if (!selectedFunnelId) return;
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: stageName,
      funnelId: selectedFunnelId,
      color: stageColorStyles[currentStages.length % stageColorStyles.length],
    };
    setStages((prev) => [...prev, newStage]);
    toast({ title: "Estágio adicionado!", description: `O estágio "${stageName}" foi adicionado.` });
  };

  const handleSaveFunnel = (funnelId: string, newName: string, newStageNames: string[]) => {
    setFunnels(prev => prev.map(f => f.id === funnelId ? { ...f, name: newName } : f));
    const existingStages = stages.filter(s => s.funnelId === funnelId);
    const updatedStages: Stage[] = [];
    const newStagesFromSave: Stage[] = [];

    newStageNames.forEach((name, index) => {
      const existing = existingStages.find(s => s.name === name);
      if (existing) {
        updatedStages.push({ ...existing, color: stageColorStyles[index % stageColorStyles.length] });
      } else {
        newStagesFromSave.push({
          id: `stage-${Date.now()}-${Math.random()}`,
          name: name,
          funnelId: funnelId,
          color: stageColorStyles[index % stageColorStyles.length],
        });
      }
    });

    setStages(prev => [ ...prev.filter(s => s.funnelId !== funnelId), ...updatedStages, ...newStagesFromSave ]);
    toast({ title: "Funil atualizado!", description: `O funil "${newName}" foi salvo.` });
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
    toast({ title: "Funil excluído!", description: `O funil "${funnelToDelete.name}" foi excluído.`, variant: "destructive" });
    setDeleteFunnelOpen(false);
  };

  const selectedFunnel = funnels.find(f => f.id === selectedFunnelId) || null;
  const currentStages = stages.filter((stage) => stage.funnelId === selectedFunnelId);
  const currentCards = cards
    .filter((card) => currentStages.map(s => s.id).includes(card.stageId))
    .map(card => {
        const contact = contacts.find(c => c.id === card.contactId);
        
        let status: "default" | "due" | "overdue" = "default";
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (card.tasks && card.tasks.length > 0) {
          const incompleteTasks = card.tasks.filter(t => !t.completed && t.dueDate);
          
          const isOverdue = incompleteTasks.some(t => {
              const dueDate = new Date(t.dueDate!);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate < today;
          });

          const isDueToday = incompleteTasks.some(t => {
              const dueDate = new Date(t.dueDate!);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate.getTime() === today.getTime();
          });

          if (isOverdue) {
              status = 'overdue';
          } else if (isDueToday) {
              status = 'due';
          }
        }

        return {
            ...card,
            contactName: contact?.name,
            tasksCount: card.tasks.length,
            tasksDoneCount: card.tasks.filter(t => t.completed).length,
            status,
        }
    });

  return (
    <>
      <Header title="Funis">
        <div className="flex items-center gap-2">
          <FunnelViewToggle viewMode={viewMode} setViewMode={setViewMode} />
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
              <Button variant="outline" size="icon" onClick={() => setEditFunnelOpen(true)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="destructive" size="icon" onClick={() => setDeleteFunnelOpen(true)}><Trash2 className="h-4 w-4" /></Button>
              <Button variant="outline" onClick={() => setCreateStageOpen(true)}><Plus className="h-4 w-4 mr-2" />Estágio</Button>
              <Button onClick={handleNewCardClick}><Plus className="h-4 w-4 mr-2" />Novo Card</Button>
            </>
          )}
          <Button onClick={() => setCreateFunnelOpen(true)} className={selectedFunnelId ? 'hidden' : ''}>Novo Funil</Button>
        </div>
      </Header>

      {funnels.length > 0 && selectedFunnelId ? (
        viewMode === 'kanban' ? (
          <FunnelBoard
            stages={currentStages}
            cards={currentCards}
            onCardMove={handleCardMove}
            onCardClick={handleCardClick}
          />
        ) : (
          <FunnelListView
            stages={currentStages}
            cards={currentCards}
            onCardClick={handleCardClick}
          />
        )
      ) : (
        <Card className="flex flex-col items-center justify-center text-center p-10">
            <h2 className="text-xl font-semibold">Nenhum funil encontrado</h2>
            <p className="text-muted-foreground mt-2 mb-4">Crie seu primeiro funil para começar a organizar seus negócios.</p>
            <Button onClick={() => setCreateFunnelOpen(true)}>Criar Primeiro Funil</Button>
        </Card>
      )}

      <CreateFunnelDialog isOpen={isCreateFunnelOpen} onOpenChange={setCreateFunnelOpen} onCreate={handleCreateFunnel} />
      <CreateStageDialog isOpen={isCreateStageOpen} onOpenChange={setCreateStageOpen} onCreate={handleCreateStage} />
      <EditFunnelDialog isOpen={isEditFunnelOpen} onOpenChange={setEditFunnelOpen} funnel={selectedFunnel} initialStages={currentStages.map(s => s.name)} onSave={handleSaveFunnel} />
      <DeleteFunnelDialog isOpen={isDeleteFunnelOpen} onOpenChange={setDeleteFunnelOpen} onConfirm={handleDeleteFunnel} />
      <CardFormDialog isOpen={isCardFormOpen} onOpenChange={setCardFormOpen} onSave={handleSaveCard} initialData={currentCard} contacts={contacts} stages={currentStages} />
    </>
  );
};

export default Funnels;