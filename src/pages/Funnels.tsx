"use client";

import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card as UiCard } from "@/components/ui/card";
import { stageColorStyles, type CardData, type Stage, type Funnel, type Contact, type TaskPriority } from "@/data/sample-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const Funnels = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [funnels, setFunnels] = React.useState<Funnel[]>([]);
  const [stages, setStages] = React.useState<Stage[]>([]);
  const [cards, setCards] = React.useState<CardData[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  
  const [loading, setLoading] = React.useState(true);
  const [selectedFunnelId, setSelectedFunnelId] = React.useState<string>("");
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');
  
  const [isCreateFunnelOpen, setCreateFunnelOpen] = React.useState(false);
  const [isCreateStageOpen, setCreateStageOpen] = React.useState(false);
  const [isEditFunnelOpen, setEditFunnelOpen] = React.useState(false);
  const [isDeleteFunnelOpen, setDeleteFunnelOpen] = React.useState(false);
  const [isCardFormOpen, setCardFormOpen] = React.useState(false);
  const [currentCard, setCurrentCard] = React.useState<Partial<CardData> | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [funnelsRes, stagesRes, cardsRes, contactsRes] = await Promise.all([
        supabase.from("funnels").select("*"),
        supabase.from("stages").select("*").order('position'),
        supabase.from("cards").select("*"),
        supabase.from("contacts").select("*"),
      ]);

      if (funnelsRes.error) throw funnelsRes.error;
      if (stagesRes.error) throw stagesRes.error;
      if (cardsRes.error) throw cardsRes.error;
      if (contactsRes.error) throw contactsRes.error;

      const fetchedFunnels = funnelsRes.data as Funnel[];
      setFunnels(fetchedFunnels);
      
      // Correctly map funnel_id to funnelId and add color
      setStages(stagesRes.data.map((s: any, i: number) => ({ 
        id: s.id, 
        name: s.name, 
        funnelId: s.funnel_id, // Corrected: map from snake_case to camelCase
        position: s.position,
        color: stageColorStyles[i % stageColorStyles.length] 
      })) as Stage[]);
      
      setCards(cardsRes.data as CardData[]);
      setContacts(contactsRes.data as Contact[]);

      if (fetchedFunnels.length > 0 && !selectedFunnelId) {
        setSelectedFunnelId(fetchedFunnels[0].id);
      }
    } catch (error: any) {
      toast({ title: "Erro ao buscar dados", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, selectedFunnelId]);

  React.useEffect(() => {
    fetchData();
  }, []);

  React.useEffect(() => {
    const cardIdToOpen = location.state?.openCardId;
    if (cardIdToOpen) {
      const cardToOpen = cards.find(c => c.id === cardIdToOpen);
      if (cardToOpen) {
        const funnelId = stages.find(s => s.id === cardToOpen.stageId)?.funnelId;
        if (funnelId) {
          setSelectedFunnelId(funnelId);
        }
        handleCardClick(cardIdToOpen);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, cards, stages, navigate, location.pathname]);

  const handleCardMove = async (cardId: string, newStageId: string) => {
    const cardToMove = cards.find(c => c.id === cardId);
    if (!cardToMove || cardToMove.stageId === newStageId) return;

    const newStage = stages.find(s => s.id === newStageId);
    if (!newStage) return;

    const isClosing = newStage.name.toLowerCase().includes('fechado');
    const updateData: Partial<CardData> & { closed_at?: string | null } = { 
      stageId: newStageId,
      closed_at: isClosing ? new Date().toISOString() : null
    };

    const { error } = await supabase.from('cards').update(updateData).eq('id', cardId);

    if (error) {
      toast({ title: "Erro ao mover card", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Card movido", description: `O card foi movido para ${newStage.name}.` });
      fetchData();
    }
  };

  const handleCardClick = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setCurrentCard(card);
      setCardFormOpen(true);
    }
  };

  const handleNewCardClick = () => {
    setCurrentCard({ stageId: currentStages[0]?.id || "" });
    setCardFormOpen(true);
  };

  const handleSaveCard = async (data: any) => {
    if (!user?.id) {
      toast({ title: "Erro", description: "Usuário não autenticado. Não foi possível criar/salvar o card.", variant: "destructive" });
      return;
    }

    const cardData = { ...data, created_by: user.id };
    let error;

    if (cardData.id) {
      ({ error } = await supabase.from('cards').update(cardData).eq('id', cardData.id));
    } else {
      ({ error } = await supabase.from('cards').insert(cardData));
    }

    if (error) {
      toast({ title: "Erro ao salvar card", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Card salvo!", description: `O card "${cardData.title}" foi salvo.` });
      setCardFormOpen(false);
      setCurrentCard(null);
      fetchData();
    }
  };

  const handleCreateFunnel = async (funnelName: string, stageNames: string[]) => {
    const { data: newFunnel, error: funnelError } = await supabase
      .from('funnels')
      .insert({ name: funnelName, created_by: user?.id })
      .select()
      .single();

    if (funnelError) {
      toast({ title: "Erro ao criar funil", description: funnelError.message, variant: "destructive" });
      return;
    }

    const newStages = stageNames.map((name, index) => ({
      name,
      funnel_id: newFunnel.id,
      position: index,
      created_by: user?.id,
    }));

    const { error: stagesError } = await supabase.from('stages').insert(newStages);

    if (stagesError) {
      toast({ title: "Erro ao criar estágios", description: stagesError.message, variant: "destructive" });
    } else {
      toast({ title: "Funil criado!", description: `O funil "${funnelName}" foi criado.` });
      setSelectedFunnelId(newFunnel.id);
      fetchData();
    }
  };

  const handleCreateStage = async (stageName: string) => {
    if (!selectedFunnelId) return;
    const { error } = await supabase.from('stages').insert({
      name: stageName,
      funnel_id: selectedFunnelId,
      position: currentStages.length,
      created_by: user?.id,
    });

    if (error) {
      toast({ title: "Erro ao adicionar estágio", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Estágio adicionado!", description: `O estágio "${stageName}" foi adicionado.` });
      fetchData();
    }
  };

  const handleSaveFunnel = async (funnelId: string, newName: string, newStageNames: string[]) => {
    // This is a complex operation. For now, we only update the funnel name.
    // A full implementation would require handling stage creation, deletion, and reordering carefully.
    const { error } = await supabase.from('funnels').update({ name: newName }).eq('id', funnelId);
    
    if (error) {
      toast({ title: "Erro ao atualizar funil", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Funil atualizado!", description: "O nome do funil foi alterado." });
      fetchData();
    }
    // Note: Stage management from this dialog is not fully implemented to prevent data loss.
    // Please manage stages individually for now.
  };

  const handleDeleteFunnel = async () => {
    if (!selectedFunnelId) return;
    const funnelToDelete = funnels.find(f => f.id === selectedFunnelId);
    if (!funnelToDelete) return;

    const stageIdsToDelete = stages.filter(s => s.funnelId === selectedFunnelId).map(s => s.id);
    
    // Delete cards, then stages, then funnel
    const { error: cardsError } = await supabase.from('cards').delete().in('stage_id', stageIdsToDelete);
    if (cardsError) {
      toast({ title: "Erro ao excluir cards", description: cardsError.message, variant: "destructive" });
      return;
    }
    const { error: stagesError } = await supabase.from('stages').delete().eq('funnel_id', selectedFunnelId);
    if (stagesError) {
      toast({ title: "Erro ao excluir estágios", description: stagesError.message, variant: "destructive" });
      return;
    }
    const { error: funnelError } = await supabase.from('funnels').delete().eq('id', selectedFunnelId);
    if (funnelError) {
      toast({ title: "Erro ao excluir funil", description: funnelError.message, variant: "destructive" });
      return;
    }

    toast({ title: "Funil excluído!", description: `O funil "${funnelToDelete.name}" foi excluído.`, variant: "destructive" });
    const remainingFunnels = funnels.filter(f => f.id !== selectedFunnelId);
    setSelectedFunnelId(remainingFunnels[0]?.id || "");
    setDeleteFunnelOpen(false);
    fetchData();
  };

  const selectedFunnel = funnels.find(f => f.id === selectedFunnelId) || null;
  const currentStages = stages.filter((stage) => stage.funnelId === selectedFunnelId);
  
  const getCardStatus = (card: CardData): "default" | "due" | "overdue" => {
    if (!card.tasks || card.tasks.length === 0) return "default";

    const incompleteTasks = card.tasks.filter(task => !task.completed && task.dueDate);
    if (incompleteTasks.length === 0) return "default";

    const now = new Date();
    const hasOverdue = incompleteTasks.some(task => task.dueDate && new Date(task.dueDate) < now);
    if (hasOverdue) return "overdue";

    const hasDueSoon = incompleteTasks.some(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3; // Due within 3 days
    });
    if (hasDueSoon) return "due";

    return "default";
  };

  const currentCards = cards
    .filter((card) => currentStages.map(s => s.id).includes(card.stageId))
    .map(card => {
        const contact = contacts.find(c => c.id === card.contactId);
        const status = getCardStatus(card); // Use the new status logic
        return { 
          ...card, 
          contactName: contact?.name, 
          tasksCount: card.tasks?.length || 0, 
          tasksDoneCount: card.tasks?.filter(t => t.completed).length || 0, 
          status 
        };
    });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-96 w-1/4" />
          <Skeleton className="h-96 w-1/4" />
          <Skeleton className="h-96 w-1/4" />
          <Skeleton className="h-96 w-1/4" />
        </div>
      </div>
    );
  }

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
          <Button onClick={() => setCreateFunnelOpen(true)} className={selectedFunnelId ? '' : 'ml-auto'}>Novo Funil</Button>
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
        <UiCard className="flex flex-col items-center justify-center text-center p-10">
            <h2 className="text-xl font-semibold">Nenhum funil encontrado</h2>
            <p className="text-muted-foreground mt-2 mb-4">Crie seu primeiro funil para começar a organizar seus negócios.</p>
            <Button onClick={() => setCreateFunnelOpen(true)}>Criar Primeiro Funil</Button>
        </UiCard>
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