"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';
import DraggableStage from '@/components/DraggableStage';
import DraggableCard from '@/components/DraggableCard';
import { Funnel, Stage, Card as CardType, Contact, Task, TaskPriority } from '../types';
import { DatePicker } from '@/components/ui/DatePicker';
import { format } from 'date-fns';

const Funnels: React.FC = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [newFunnelName, setNewFunnelName] = useState('');
  const [isAddFunnelDialogOpen, setIsAddFunnelDialogOpen] = useState(false);

  const [isAddStageDialogOpen, setIsAddStageDialogOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');

  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);

  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  // State for the new card form
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const [selectedStageIdForCard, setSelectedStageIdForCard] = useState<string | null>(null);
  const [newCardData, setNewCardData] = useState<Partial<CardType>>({});
  const [newTasks, setNewTasks] = useState<Partial<Task>[]>([]);
  const [currentTaskText, setCurrentTaskText] = useState('');
  const [currentTaskPriority, setCurrentTaskPriority] = useState<TaskPriority>('medium');
  const [currentTaskDueDate, setCurrentTaskDueDate] = useState<Date | undefined>();

  const [isDeleteStageDialogOpen, setIsDeleteStageDialogOpen] = useState(false);
  const [stageToDeleteId, setStageToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchFunnels();
    fetchStages();
    fetchCards();
    fetchContacts();
  }, []);

  const fetchFunnels = async () => {
    const { data, error } = await supabase.from('funnels').select('*');
    if (error) toast.error('Erro ao carregar funis: ' + error.message);
    else {
      setFunnels(data);
      if (data.length > 0 && !selectedFunnelId) setSelectedFunnelId(data[0].id);
    }
  };

  const fetchStages = async () => {
    const { data, error } = await supabase.from('stages').select('*').order('position', { ascending: true });
    if (error) toast.error('Erro ao carregar estágios: ' + error.message);
    else setStages(data);
  };

  const fetchCards = async () => {
    const { data, error } = await supabase.from('cards').select('*');
    if (error) toast.error('Erro ao carregar cards: ' + error.message);
    else setCards(data);
  };

  const fetchContacts = async () => {
    const { data, error } = await supabase.from('contacts').select('*').order('name', { ascending: true });
    if (error) toast.error('Erro ao carregar contatos: ' + error.message);
    else setContacts(data);
  };

  const handleAddFunnel = async () => {
    if (!newFunnelName.trim()) return toast.error('O nome do funil não pode ser vazio.');
    const { data, error } = await supabase.from('funnels').insert({ name: newFunnelName }).select();
    if (error) toast.error('Erro ao adicionar funil: ' + error.message);
    else if (data?.[0]) {
      setFunnels([...funnels, data[0]]);
      setNewFunnelName('');
      setIsAddFunnelDialogOpen(false);
      toast.success('Funil adicionado com sucesso!');
    }
  };

  const handleAddStage = async () => {
    if (!newStageName.trim() || !selectedFunnelId) return toast.error('Nome do estágio e funil são obrigatórios.');
    const newPosition = stages.filter(s => s.funnel_id === selectedFunnelId).length;
    const { data, error } = await supabase.from('stages').insert({ name: newStageName, funnel_id: selectedFunnelId, position: newPosition }).select();
    if (error) toast.error('Erro ao adicionar estágio: ' + error.message);
    else if (data?.[0]) {
      setStages([...stages, data[0]]);
      setNewStageName('');
      setIsAddStageDialogOpen(false);
      toast.success('Estágio adicionado com sucesso!');
    }
  };

  const handleEditStage = (stage: Stage) => {
    setSelectedStage(stage);
    setNewStageName(stage.name);
    setIsEditStageDialogOpen(true);
  };

  const handleUpdateStage = async () => {
    if (!selectedStage || !newStageName.trim()) return toast.error('Nome do estágio não pode ser vazio.');
    const { error } = await supabase.from('stages').update({ name: newStageName }).eq('id', selectedStage.id);
    if (error) toast.error('Erro ao atualizar estágio: ' + error.message);
    else {
      setStages(stages.map(s => (s.id === selectedStage.id ? { ...s, name: newStageName } : s)));
      setIsEditStageDialogOpen(false);
      toast.success('Estágio atualizado com sucesso!');
    }
  };

  const handleDeleteStage = (stageId: string) => {
    setStageToDeleteId(stageId);
    setIsDeleteStageDialogOpen(true);
  };

  const confirmDeleteStage = async () => {
    if (!stageToDeleteId) return;
    const { error } = await supabase.from('stages').delete().eq('id', stageToDeleteId);
    if (error) toast.error('Erro ao excluir estágio: ' + error.message);
    else {
      setStages(stages.filter(s => s.id !== stageToDeleteId));
      setIsDeleteStageDialogOpen(false);
      toast.success('Estágio excluído com sucesso!');
    }
  };

  const handleAddCard = (stageId: string) => {
    setSelectedStageIdForCard(stageId);
    setNewCardData({ stage_id: stageId });
    setNewTasks([]);
    setIsAddCardDialogOpen(true);
  };

  const handleAddTaskToList = () => {
    if (!currentTaskText.trim()) return toast.error('O texto da tarefa não pode ser vazio.');
    const task: Partial<Task> = {
      text: currentTaskText,
      priority: currentTaskPriority,
      due_date: currentTaskDueDate ? format(currentTaskDueDate, 'yyyy-MM-dd') : undefined,
    };
    setNewTasks([...newTasks, task]);
    setCurrentTaskText('');
    setCurrentTaskPriority('medium');
    setCurrentTaskDueDate(undefined);
  };

  const handleRemoveTaskFromList = (index: number) => {
    setNewTasks(newTasks.filter((_, i) => i !== index));
  };

  const handleCreateCard = async () => {
    if (!newCardData.title?.trim() || !selectedStageIdForCard) {
      return toast.error('Título do card e estágio são obrigatórios.');
    }

    const cardPayload = { ...newCardData, stage_id: selectedStageIdForCard };
    const { data: cardData, error: cardError } = await supabase.from('cards').insert(cardPayload).select().single();

    if (cardError) return toast.error('Erro ao criar card: ' + cardError.message);
    if (!cardData) return toast.error('Falha ao obter dados do card criado.');

    toast.success('Card criado com sucesso!');
    setCards(prev => [...prev, cardData]);

    if (newTasks.length > 0) {
      const tasksPayload = newTasks.map(task => ({ ...task, card_id: cardData.id }));
      const { error: tasksError } = await supabase.from('tasks').insert(tasksPayload);
      if (tasksError) toast.error('Erro ao salvar tarefas: ' + tasksError.message);
      else toast.success(`${newTasks.length} tarefa(s) adicionada(s).`);
    }

    setIsAddCardDialogOpen(false);
    setNewCardData({});
    setNewTasks([]);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    if (type === 'stage') {
      const newStages = Array.from(stages);
      const [movedStage] = newStages.splice(source.index, 1);
      newStages.splice(destination.index, 0, movedStage);
      setStages(newStages);
      newStages.forEach(async (stage, index) => {
        await supabase.from('stages').update({ position: index }).eq('id', stage.id);
      });
    } else if (type === 'card') {
      const newCards = cards.map(c => c.id === draggableId ? { ...c, stage_id: destination.droppableId } : c);
      setCards(newCards);
      const { error } = await supabase.from('cards').update({ stage_id: destination.droppableId }).eq('id', draggableId);
      if (error) toast.error('Erro ao mover card: ' + error.message);
    }
  };

  const filteredStages = stages.filter(stage => stage.funnel_id === selectedFunnelId);
  const contactNameById = new Map(contacts.map(c => [c.id, c.name]));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gerenciamento de Funis</h1>
      <div className="mb-6 flex items-center space-x-4">
        <Select value={selectedFunnelId || ''} onValueChange={setSelectedFunnelId}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Selecione um funil" /></SelectTrigger>
          <SelectContent>{funnels.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={() => setIsAddFunnelDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Funil</Button>
        {selectedFunnelId && <Button variant="secondary" onClick={() => setIsAddStageDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Estágio</Button>}
      </div>

      {selectedFunnelId ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-stages" direction="horizontal" type="stage">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex overflow-x-auto pb-4 custom-scrollbar">
                {filteredStages.map((stage, index) => (
                  <DraggableStage key={stage.id} stage={stage} index={index} onEditStage={handleEditStage} onDeleteStage={handleDeleteStage} onAddCard={handleAddCard}>
                    <Droppable droppableId={stage.id} type="card">
                      {(providedInner) => (
                        <div ref={providedInner.innerRef} {...providedInner.droppableProps} className="min-h-[100px] flex-grow">
                          {cards.filter(c => c.stage_id === stage.id).map((card, cardIndex) => (
                            <DraggableCard key={card.id} card={card} index={cardIndex} contactName={card.contact_id ? contactNameById.get(card.contact_id) : undefined} />
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
      ) : <p className="text-gray-600">Selecione um funil ou adicione um novo para começar.</p>}

      {/* Add/Edit Modals */}
      <Dialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Card</DialogTitle>
            <DialogDescription>Preencha os detalhes abaixo para criar uma nova oportunidade.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-4 p-1">
              <h3 className="text-lg font-semibold">Detalhes do Card</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Título do Card</Label>
                  <Input id="title" value={newCardData.title || ''} onChange={e => setNewCardData(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Follow-up com cliente" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Nome da Empresa</Label>
                    <Input id="company_name" value={newCardData.company_name || ''} onChange={e => setNewCardData(p => ({ ...p, company_name: e.target.value }))} placeholder="Ex: Acme Inc." />
                  </div>
                  <div>
                    <Label htmlFor="business_type">Tipo de Negócio</Label>
                    <Input id="business_type" value={newCardData.business_type || ''} onChange={e => setNewCardData(p => ({ ...p, business_type: e.target.value }))} placeholder="Ex: Software, Consultoria" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="value">Valor do Negócio (R$)</Label>
                    <Input id="value" type="number" value={newCardData.value || ''} onChange={e => setNewCardData(p => ({ ...p, value: parseFloat(e.target.value) || null }))} placeholder="1500.00" />
                  </div>
                  <div>
                    <Label htmlFor="source">Fonte</Label>
                    <Input id="source" value={newCardData.source || ''} onChange={e => setNewCardData(p => ({ ...p, source: e.target.value }))} placeholder="Ex: Indicação" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" value={newCardData.description || ''} onChange={e => setNewCardData(p => ({ ...p, description: e.target.value }))} placeholder="Adicione detalhes sobre a oportunidade..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Estágio</Label>
                    <Input disabled value={stages.find(s => s.id === selectedStageIdForCard)?.name || 'N/A'} />
                  </div>
                  <div>
                    <Label>Contato</Label>
                    <Select value={newCardData.contact_id || undefined} onValueChange={v => setNewCardData(p => ({ ...p, contact_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione um contato" /></SelectTrigger>
                      <SelectContent>{contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 p-1">
              <h3 className="text-lg font-semibold">Tarefas</h3>
              <div className="flex items-end gap-2">
                <div className="flex-grow"><Input placeholder="Nova tarefa..." value={currentTaskText} onChange={e => setCurrentTaskText(e.target.value)} /></div>
                <div className="w-[120px]">
                  <Select value={currentTaskPriority} onValueChange={v => setCurrentTaskPriority(v as TaskPriority)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]"><DatePicker date={currentTaskDueDate} setDate={setCurrentTaskDueDate} /></div>
                <Button onClick={handleAddTaskToList}>Adicionar</Button>
              </div>
              <div className="space-y-2">
                {newTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                    <div className="text-sm">{task.text}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{task.priority}</span>
                      <span className="text-xs text-gray-500">{task.due_date}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveTaskFromList(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCardDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateCard}>Salvar Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Funnels;