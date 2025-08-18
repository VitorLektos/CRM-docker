"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import DraggableStage from '@/components/DraggableStage';
import DraggableCard from '@/components/DraggableCard';
import { Funnel, Stage, Card as CardType } from '../types/index'; // Caminho de importação ajustado

const Funnels: React.FC = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [newFunnelName, setNewFunnelName] = useState('');
  const [isAddFunnelDialogOpen, setIsAddFunnelDialogOpen] = useState(false);
  const [isAddStageDialogOpen, setIsAddStageDialogOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const [selectedStageIdForCard, setSelectedStageIdForCard] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isDeleteStageDialogOpen, setIsDeleteStageDialogOpen] = useState(false);
  const [stageToDeleteId, setStageToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchFunnels();
    fetchStages();
    fetchCards();
  }, []);

  const fetchFunnels = async () => {
    const { data, error } = await supabase.from('funnels').select('*');
    if (error) {
      toast.error('Erro ao carregar funis: ' + error.message);
    } else {
      setFunnels(data);
      if (data.length > 0 && !selectedFunnelId) {
        setSelectedFunnelId(data[0].id);
      }
    }
  };

  const fetchStages = async () => {
    const { data, error } = await supabase.from('stages').select('*').order('position', { ascending: true });
    if (error) {
      toast.error('Erro ao carregar estágios: ' + error.message);
    } else {
      setStages(data);
    }
  };

  const fetchCards = async () => {
    const { data, error } = await supabase.from('cards').select('*');
    if (error) {
      toast.error('Erro ao carregar cards: ' + error.message);
    } else {
      setCards(data);
    }
  };

  const handleAddFunnel = async () => {
    if (!newFunnelName.trim()) {
      toast.error('O nome do funil não pode ser vazio.');
      return;
    }
    const { data, error } = await supabase.from('funnels').insert({ name: newFunnelName }).select();
    if (error) {
      toast.error('Erro ao adicionar funil: ' + error.message);
    } else {
      setFunnels([...funnels, data[0]]);
      setNewFunnelName('');
      setIsAddFunnelDialogOpen(false);
      toast.success('Funil adicionado com sucesso!');
    }
  };

  const handleAddStage = async () => {
    if (!newStageName.trim() || !selectedFunnelId) {
      toast.error('Nome do estágio e funil são obrigatórios.');
      return;
    }

    const newPosition = stages.filter(s => s.funnel_id === selectedFunnelId).length;

    const { data, error } = await supabase
      .from('stages')
      .insert({ name: newStageName, funnel_id: selectedFunnelId, position: newPosition })
      .select();

    if (error) {
      toast.error('Erro ao adicionar estágio: ' + error.message);
    } else {
      setStages([...stages, data[0]]);
      setNewStageName('');
      setIsAddStageDialogOpen(false);
      toast.success('Estágio adicionado com sucesso!');
    }
  };

  const handleEditStage = (stage: Stage) => {
    setSelectedStage(stage);
    setNewStageName(stage.name); // Pre-fill the input with current stage name
    setIsEditStageDialogOpen(true);
  };

  const handleUpdateStage = async () => {
    if (!selectedStage || !newStageName.trim()) {
      toast.error('Nome do estágio não pode ser vazio.');
      return;
    }

    const { error } = await supabase
      .from('stages')
      .update({ name: newStageName })
      .eq('id', selectedStage.id);

    if (error) {
      toast.error('Erro ao atualizar estágio: ' + error.message);
    } else {
      setStages(stages.map(s => s.id === selectedStage.id ? { ...s, name: newStageName } : s));
      setIsEditStageDialogOpen(false);
      setSelectedStage(null);
      setNewStageName('');
      toast.success('Estágio atualizado com sucesso!');
    }
  };

  const handleDeleteStage = (stageId: string) => {
    setStageToDeleteId(stageId);
    setIsDeleteStageDialogOpen(true);
  };

  const confirmDeleteStage = async () => {
    if (!stageToDeleteId) return;

    const { error } = await supabase
      .from('stages')
      .delete()
      .eq('id', stageToDeleteId);

    if (error) {
      toast.error('Erro ao excluir estágio: ' + error.message);
    } else {
      setStages(stages.filter(s => s.id !== stageToDeleteId));
      setIsDeleteStageDialogOpen(false);
      setStageToDeleteId(null);
      toast.success('Estágio excluído com sucesso!');
    }
  };

  const handleAddCard = (stageId: string) => {
    setSelectedStageIdForCard(stageId);
    setNewCardTitle(''); // Clear previous input
    setIsAddCardDialogOpen(true);
  };

  const handleCreateCard = async () => {
    if (!newCardTitle.trim() || !selectedStageIdForCard) {
      toast.error('Título do card e estágio são obrigatórios.');
      return;
    }

    const { data, error } = await supabase
      .from('cards')
      .insert({ title: newCardTitle, stage_id: selectedStageIdForCard })
      .select();

    if (error) {
      toast.error('Erro ao adicionar card: ' + error.message);
    } else {
      setCards([...cards, data[0]]);
      setNewCardTitle('');
      setIsAddCardDialogOpen(false);
      setSelectedStageIdForCard(null);
      toast.success('Card adicionado com sucesso!');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'stage') {
      const newStages = Array.from(stages);
      const [movedStage] = newStages.splice(source.index, 1);
      newStages.splice(destination.index, 0, movedStage);

      setStages(newStages);

      // Update positions in DB
      newStages.forEach(async (stage, index) => {
        if (stage.position !== index) {
          await supabase.from('stages').update({ position: index }).eq('id', stage.id);
        }
      });
      return;
    }

    if (type === 'card') {
      const startStage = stages.find(s => s.id === source.droppableId);
      const endStage = stages.find(s => s.id === destination.droppableId);

      if (!startStage || !endStage) return;

      const newCards = Array.from(cards);
      const movedCardIndex = newCards.findIndex(card => card.id === draggableId);
      if (movedCardIndex === -1) return;

      const movedCard = newCards[movedCardIndex];

      // Update card's stage_id
      movedCard.stage_id = endStage.id;

      setCards(newCards);

      // Update in DB
      const { error } = await supabase
        .from('cards')
        .update({ stage_id: endStage.id })
        .eq('id', movedCard.id);

      if (error) {
        toast.error('Erro ao mover card: ' + error.message);
      }
      return;
    }
  };

  const filteredStages = stages.filter(stage => stage.funnel_id === selectedFunnelId);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gerenciamento de Funis</h1>

      <div className="mb-6 flex items-center space-x-4">
        <select
          value={selectedFunnelId || ''}
          onChange={(e) => setSelectedFunnelId(e.target.value)}
          className="p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {funnels.map((funnel) => (
            <option key={funnel.id} value={funnel.id}>
              {funnel.name}
            </option>
          ))}
        </select>
        <Button onClick={() => setIsAddFunnelDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Funil
        </Button>
        {selectedFunnelId && (
          <Button onClick={() => setIsAddStageDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Estágio
          </Button>
        )}
      </div>

      {selectedFunnelId ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-stages" direction="horizontal" type="stage">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex overflow-x-auto pb-4 custom-scrollbar"
              >
                {filteredStages.map((stage, index) => (
                  <DraggableStage
                    key={stage.id}
                    stage={stage}
                    index={index}
                    onEditStage={handleEditStage}
                    onDeleteStage={handleDeleteStage}
                    onAddCard={handleAddCard}
                  >
                    <Droppable droppableId={stage.id} type="card">
                      {(providedInner) => (
                        <div
                          ref={providedInner.innerRef}
                          {...providedInner.droppableProps}
                          className="min-h-[100px] flex-grow"
                        >
                          {cards
                            .filter((card) => card.stage_id === stage.id)
                            .map((card, cardIndex) => (
                              <DraggableCard key={card.id} card={card} index={cardIndex} />
                            ))}
                          {providedInner.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DraggableStage>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <p className="text-gray-600">Selecione um funil ou adicione um novo para começar.</p>
      )}

      {/* Add Funnel Dialog */}
      <Dialog open={isAddFunnelDialogOpen} onOpenChange={setIsAddFunnelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Funil</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="funnelName">Nome do Funil</Label>
            <Input
              id="funnelName"
              value={newFunnelName}
              onChange={(e) => setNewFunnelName(e.target.value)}
              placeholder="Nome do Funil"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFunnelDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddFunnel}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Stage Dialog */}
      <Dialog open={isAddStageDialogOpen} onOpenChange={setIsAddStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Estágio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="stageName">Nome do Estágio</Label>
            <Input
              id="stageName"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="Nome do Estágio"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStageDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddStage}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={isEditStageDialogOpen} onOpenChange={setIsEditStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Estágio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="editStageName">Nome do Estágio</Label>
            <Input
              id="editStageName"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="Nome do Estágio"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditStageDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateStage}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Stage Confirmation Dialog */}
      <Dialog open={isDeleteStageDialogOpen} onOpenChange={setIsDeleteStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza de que deseja excluir este estágio? Todos os cards associados também serão excluídos.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteStageDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDeleteStage}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Card</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="cardTitle">Título do Card</Label>
            <Input
              id="cardTitle"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Título do Card"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCardDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateCard}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Funnels;