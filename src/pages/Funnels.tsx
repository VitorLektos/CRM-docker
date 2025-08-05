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

// Interfaces
interface HistoryEntry {
  id: string;
  date: string;
  description: string;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CardData {
  id: string;
  title: string;
  companyName?: string;
  businessType?: string;
  description?: string;
  contactId?: string;
  tasks: Task[];
  stageId: string;
  value: number;
  source?: string;
  createdAt: string;
  history: HistoryEntry[];
}

interface Stage {
  id: string;
  name: string;
  funnelId: string;
  color: { bg: string; text: string };
}

interface Funnel {
  id: string;
  name: string;
}

// Sample Data
const sampleContacts: Contact[] = [
    { id: 'contact-1', name: 'João Silva', email: 'joao.silva@example.com', phone: '(11) 98765-4321' },
    { id: 'contact-2', name: 'Maria Oliveira', email: 'maria.o@example.com', phone: '(21) 91234-5678' },
    { id: 'contact-3', name: 'Pedro Santos', email: 'pedro.santos@example.com', phone: '(31) 95555-5555' },
    { id: 'contact-4', name: 'Ana Costa', email: 'ana.costa@example.com', phone: '(41) 94444-4444' },
];

const stageColorStyles = [
    { bg: "bg-sky-100", text: "text-sky-800" },
    { bg: "bg-green-100", text: "text-green-800" },
    { bg: "bg-amber-100", text: "text-amber-800" },
    { bg: "bg-rose-100", text: "text-rose-800" },
    { bg: "bg-indigo-100", text: "text-indigo-800" },
    { bg: "bg-teal-100", text: "text-teal-800" },
];

const sampleFunnels: Funnel[] = [
  { id: "funnel-1", name: "Funil de Vendas" },
  { id: "funnel-2", name: "Funil de Marketing" },
];

const sampleStages: Stage[] = [
  { id: "stage-1", name: "Novo", funnelId: "funnel-1", color: stageColorStyles[0] },
  { id: "stage-2", name: "Contato Feito", funnelId: "funnel-1", color: stageColorStyles[1] },
  { id: "stage-3", name: "Proposta", funnelId: "funnel-1", color: stageColorStyles[2] },
  { id: "stage-4", name: "Fechado", funnelId: "funnel-1", color: stageColorStyles[3] },
  { id: "stage-5", name: "Lead", funnelId: "funnel-2", color: stageColorStyles[4] },
  { id: "stage-6", name: "MQL", funnelId: "funnel-2", color: stageColorStyles[5] },
  { id: "stage-7", name: "SQL", funnelId: "funnel-2", color: stageColorStyles[0] },
];

const sampleCards: CardData[] = [
  { id: "card-1", title: "Contato João", companyName: "Tech Solutions", businessType: "SaaS", description: "Interessado no produto X", contactId: "contact-1", tasks: [{id: 'task-1', text: 'Follow-up call', completed: false, dueDate: '2024-09-10'}], stageId: "stage-1", value: 1500, source: "Indicação", createdAt: new Date(2024, 7, 1).toISOString(), history: [{ id: 'hist-1', date: new Date(2024, 7, 1).toISOString(), description: 'Card criado.' }] },
  { id: "card-2", title: "Contato Ana", companyName: "Inova Corp", businessType: "Consultoria", description: "Aguardando resposta", contactId: "contact-4", tasks: [{id: 'task-2', text: 'Enviar proposta', completed: true}, {id: 'task-3', text: 'Agendar reunião', completed: false}], stageId: "stage-2", value: 3200, source: "Website", createdAt: new Date(2024, 6, 28).toISOString(), history: [{ id: 'hist-2', date: new Date(2024, 6, 28).toISOString(), description: 'Card criado.' }] },
  { id: "card-3", title: "Lead do Ebook", companyName: "Marketing Digital BR", businessType: "Agência", description: "Baixou o ebook de marketing", contactId: "contact-3", tasks: [], stageId: "stage-5", value: 500, source: "Marketing de Conteúdo", createdAt: new Date(2024, 7, 5).toISOString(), history: [{ id: 'hist-3', date: new Date(2024, 7, 5).toISOString(), description: 'Card criado.' }] },
];

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