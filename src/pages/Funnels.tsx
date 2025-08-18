"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
}
from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2, Edit, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "react-hot-toast";
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DraggableCard } from "@/components/DraggableCard";
import { DraggableStage } from "@/components/DraggableStage";

interface Funnel {
  id: string;
  name: string;
}

interface Stage {
  id: string;
  name: string;
  position: number;
  funnel_id: string;
  cards: Card[];
}

interface Card {
  id: string;
  stage_id: string;
  contact_id?: string;
  title: string;
  description?: string;
  value?: number;
  source?: string;
  company_name?: string;
  business_type?: string;
  closed_at?: string;
  tasks?: Task[];
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export default function Funnels() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [newFunnelName, setNewFunnelName] = useState("");
  const [isFunnelModalOpen, setIsFunnelModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [currentStageIdForCard, setCurrentStageIdForCard] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<Partial<Card>>({ tasks: [] });
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const fetchFunnels = useCallback(async () => {
    const { data, error } = await supabase.from("funnels").select("*");
    if (error) {
      console.error("Error fetching funnels:", error);
      toast.error("Erro ao carregar funis.");
    } else {
      setFunnels(data);
      if (data.length > 0 && !selectedFunnel) {
        setSelectedFunnel(data[0].id);
      }
    }
  }, [selectedFunnel]);

  const fetchStagesAndCards = useCallback(async () => {
    if (!selectedFunnel) {
      setStages([]);
      return;
    }
    const { data: stagesData, error: stagesError } = await supabase
      .from("stages")
      .select("*")
      .eq("funnel_id", selectedFunnel)
      .order("position", { ascending: true });

    if (stagesError) {
      console.error("Error fetching stages:", stagesError);
      toast.error("Erro ao carregar estágios.");
      return;
    }

    const stagesWithCards = await Promise.all(
      stagesData.map(async (stage) => {
        const { data: cardsData, error: cardsError } = await supabase
          .from("cards")
          .select("*")
          .eq("stage_id", stage.id);

        if (cardsError) {
          console.error(`Error fetching cards for stage ${stage.id}:`, cardsError);
          toast.error(`Erro ao carregar cards para o estágio ${stage.name}.`);
          return { ...stage, cards: [] };
        }
        return { ...stage, cards: cardsData };
      })
    );
    setStages(stagesWithCards);
  }, [selectedFunnel]);

  useEffect(() => {
    fetchFunnels();
  }, [fetchFunnels]);

  useEffect(() => {
    fetchStagesAndCards();
  }, [fetchStagesAndCards, selectedFunnel]);

  const handleCreateFunnel = async () => {
    if (!newFunnelName.trim()) {
      toast.error("O nome do funil não pode ser vazio.");
      return;
    }
    const { data, error } = await supabase
      .from("funnels")
      .insert([{ name: newFunnelName }])
      .select();
    if (error) {
      console.error("Error creating funnel:", error);
      toast.error("Erro ao criar funil.");
    } else {
      setFunnels((prev) => [...prev, data[0]]);
      setSelectedFunnel(data[0].id);
      setNewFunnelName("");
      setIsFunnelModalOpen(false);
      toast.success("Funil criado com sucesso!");
    }
  };

  const handleDeleteFunnel = async (funnelId: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este funil e todos os seus estágios e cards?")) {
      return;
    }
    const { error } = await supabase.from("funnels").delete().eq("id", funnelId);
    if (error) {
      console.error("Error deleting funnel:", error);
      toast.error("Erro ao deletar funil.");
    } else {
      setFunnels((prev) => prev.filter((f) => f.id !== funnelId));
      setSelectedFunnel(null);
      setStages([]);
      toast.success("Funil deletado com sucesso!");
    }
  };

  const handleCreateStage = async () => {
    if (!newStageName.trim() || !selectedFunnel) {
      toast.error("Nome do estágio e funil são obrigatórios.");
      return;
    }
    const newPosition = stages.length > 0 ? Math.max(...stages.map(s => s.position)) + 1 : 0;
    const { data, error } = await supabase
      .from("stages")
      .insert([{ name: newStageName, funnel_id: selectedFunnel, position: newPosition }])
      .select();
    if (error) {
      console.error("Error creating stage:", error);
      toast.error("Erro ao criar estágio.");
    } else {
      setStages((prev) => [...prev, { ...data[0], cards: [] }]);
      setNewStageName("");
      setIsStageModalOpen(false);
      toast.success("Estágio criado com sucesso!");
    }
  };

  const handleUpdateStage = async () => {
    if (!editingStage || !editingStage.name.trim()) {
      toast.error("Nome do estágio não pode ser vazio.");
      return;
    }
    const { error } = await supabase
      .from("stages")
      .update({ name: editingStage.name })
      .eq("id", editingStage.id);
    if (error) {
      console.error("Error updating stage:", error);
      toast.error("Erro ao atualizar estágio.");
    } else {
      setStages((prev) =>
        prev.map((s) => (s.id === editingStage.id ? { ...s, name: editingStage.name } : s))
      );
      setEditingStage(null);
      setIsStageModalOpen(false);
      toast.success("Estágio atualizado com sucesso!");
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este estágio e todos os seus cards?")) {
      return;
    }
    const { error } = await supabase.from("stages").delete().eq("id", stageId);
    if (error) {
      console.error("Error deleting stage:", error);
      toast.error("Erro ao deletar estágio.");
    } else {
      setStages((prev) => prev.filter((s) => s.id !== stageId));
      toast.success("Estágio deletado com sucesso!");
    }
  };

  const handleOpenCardModal = (stageId: string, card?: Card) => {
    setCurrentStageIdForCard(stageId);
    if (card) {
      setEditingCard(card);
      setCardForm({
        ...card,
        // Ensure tasks is an array, even if null/undefined from DB
        tasks: card.tasks || [],
        // Convert closed_at to Date object if it exists for Calendar component
        closed_at: card.closed_at ? format(new Date(card.closed_at), 'yyyy-MM-dd') : undefined,
      });
    } else {
      setEditingCard(null);
      setCardForm({ tasks: [] });
    }
    setIsCardModalOpen(true);
  };

  const handleSaveCard = async () => {
    if (!cardForm.title?.trim() || !currentStageIdForCard) {
      toast.error("Título do card e estágio são obrigatórios.");
      return;
    }

    const cardDataToSave = {
      ...cardForm,
      stage_id: currentStageIdForCard,
      // Convert camelCase to snake_case for Supabase
      company_name: cardForm.company_name, // Already snake_case if from DB, but good to be explicit
      business_type: cardForm.business_type, // Corrected from businessType
      closed_at: cardForm.closed_at, // Already snake_case if from DB, but good to be explicit
      tasks: cardForm.tasks, // tasks is already JSONB, so it's fine
    };

    if (editingCard) {
      const { error } = await supabase
        .from("cards")
        .update(cardDataToSave)
        .eq("id", editingCard.id);
      if (error) {
        console.error("Error updating card:", error);
        toast.error("Erro ao atualizar card.");
      } else {
        toast.success("Card atualizado com sucesso!");
      }
    } else {
      const { error } = await supabase
        .from("cards")
        .insert([cardDataToSave]);
      if (error) {
        console.error("Error creating card:", error);
        toast.error("Erro ao criar card.");
      } else {
        toast.success("Card criado com sucesso!");
      }
    }
    setIsCardModalOpen(false);
    fetchStagesAndCards(); // Refresh data
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este card?")) {
      return;
    }
    const { error } = await supabase.from("cards").delete().eq("id", cardId);
    if (error) {
      console.error("Error deleting card:", error);
      toast.error("Erro ao deletar card.");
    } else {
      toast.success("Card deletado com sucesso!");
      fetchStagesAndCards(); // Refresh data
    }
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Math.random().toString(36).substring(2, 11), // Simple unique ID for frontend
        text: newTaskText,
        completed: false,
        due_date: newTaskDueDate ? format(newTaskDueDate, 'yyyy-MM-dd') : undefined,
        priority: newTaskPriority,
      };
      setCardForm((prev) => ({
        ...prev,
        tasks: [...(prev.tasks || []), newTask],
      }));
      setNewTaskText("");
      setNewTaskDueDate(undefined);
      setNewTaskPriority('medium');
    }
  };

  const handleRemoveTask = (taskId: string) => {
    setCardForm((prev) => ({
      ...prev,
      tasks: (prev.tasks || []).filter((task) => task.id !== taskId),
    }));
  };

  const handleToggleTaskCompletion = (taskId: string) => {
    setCardForm((prev) => ({
      ...prev,
      tasks: (prev.tasks || []).map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    }));
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id) return;

    // Dragging a card
    if (active.data.current?.type === "Card" && over.data.current?.type === "Card") {
      const oldStageId = active.data.current?.stageId;
      const newStageId = over.data.current?.stageId;

      if (oldStageId === newStageId) {
        // Reordering within the same stage
        setStages((prevStages) =>
          prevStages.map((stage) => {
            if (stage.id === oldStageId) {
              const oldIndex = stage.cards.findIndex((card) => card.id === active.id);
              const newIndex = stage.cards.findIndex((card) => card.id === over.id);
              return {
                ...stage,
                cards: arrayMove(stage.cards, oldIndex, newIndex),
              };
            }
            return stage;
          })
        );
      } else {
        // Moving card to a different stage
        const movedCard = stages
          .find((s) => s.id === oldStageId)
          ?.cards.find((c) => c.id === active.id);

        if (movedCard) {
          setStages((prevStages) =>
            prevStages.map((stage) => {
              if (stage.id === oldStageId) {
                return {
                  ...stage,
                  cards: stage.cards.filter((card) => card.id !== active.id),
                };
              } else if (stage.id === newStageId) {
                const overIndex = stage.cards.findIndex((card) => card.id === over.id);
                const newCards = [...stage.cards];
                newCards.splice(overIndex !== -1 ? overIndex : newCards.length, 0, {
                  ...movedCard,
                  stage_id: newStageId,
                });
                return {
                  ...stage,
                  cards: newCards,
                };
              }
              return stage;
            })
          );

          // Update card's stage_id in Supabase
          const { error } = await supabase
            .from("cards")
            .update({ stage_id: newStageId })
            .eq("id", active.id);
          if (error) {
            console.error("Error updating card stage:", error);
            toast.error("Erro ao mover card.");
            fetchStagesAndCards(); // Revert on error
          } else {
            toast.success("Card movido com sucesso!");
          }
        }
      }
    }
    // Dragging a card to an empty stage
    else if (active.data.current?.type === "Card" && over.data.current?.type === "Stage") {
      const oldStageId = active.data.current?.stageId;
      const newStageId = over.id as string;

      const movedCard = stages
        .find((s) => s.id === oldStageId)
        ?.cards.find((c) => c.id === active.id);

      if (movedCard) {
        setStages((prevStages) =>
          prevStages.map((stage) => {
            if (stage.id === oldStageId) {
              return {
                ...stage,
                cards: stage.cards.filter((card) => card.id !== active.id),
              };
            } else if (stage.id === newStageId) {
              return {
                ...stage,
                cards: [...stage.cards, { ...movedCard, stage_id: newStageId }],
              };
            }
            return stage;
          })
        );

        const { error } = await supabase
          .from("cards")
          .update({ stage_id: newStageId })
          .eq("id", active.id);
        if (error) {
          console.error("Error updating card stage:", error);
          toast.error("Erro ao mover card.");
          fetchStagesAndCards(); // Revert on error
        } else {
          toast.success("Card movido com sucesso!");
        }
      }
    }
    // Dragging a stage
    else if (active.data.current?.type === "Stage" && over.data.current?.type === "Stage") {
      const oldIndex = stages.findIndex((stage) => stage.id === active.id);
      const newIndex = stages.findIndex((stage) => stage.id === over.id);

      const newStagesOrder = arrayMove(stages, oldIndex, newIndex);
      setStages(newStagesOrder);

      // Update positions in Supabase
      for (let i = 0; i < newStagesOrder.length; i++) {
        const stage = newStagesOrder[i];
        if (stage.position !== i) {
          const { error } = await supabase
            .from("stages")
            .update({ position: i })
            .eq("id", stage.id);
          if (error) {
            console.error("Error updating stage position:", error);
            toast.error("Erro ao reordenar estágios.");
            fetchStagesAndCards(); // Revert on error
            break;
          }
        }
      }
      toast.success("Estágios reordenados com sucesso!");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gerenciamento de Funis</h1>

      <div className="flex items-center space-x-4 mb-6">
        <Select
          value={selectedFunnel || ""}
          onValueChange={(value) => setSelectedFunnel(value)}
        >
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Selecione um Funil" />
          </SelectTrigger>
          <SelectContent>
            {funnels.map((funnel) => (
              <SelectItem key={funnel.id} value={funnel.id}>
                {funnel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setIsFunnelModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Funil
        </Button>
        {selectedFunnel && (
          <Button
            variant="destructive"
            onClick={() => handleDeleteFunnel(selectedFunnel)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Deletar Funil
          </Button>
        )}
      </div>

      {selectedFunnel && (
        <div className="flex-1 overflow-auto">
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
            <div className="flex space-x-4 h-full items-start">
              <SortableContext items={stages.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {stages.map((stage) => (
                  <DraggableStage key={stage.id} id={stage.id} name={stage.name}>
                    <div className="bg-white rounded-lg shadow-md p-4 w-80 flex-shrink-0 h-full flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">{stage.name}</h2>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingStage(stage);
                              setNewStageName(stage.name);
                              setIsStageModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStage(stage.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
                        <SortableContext items={stage.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                          {stage.cards.map((card) => (
                            <DraggableCard key={card.id} id={card.id} stageId={stage.id}>
                              <ShadcnCard className="bg-gray-50 border border-gray-200 shadow-sm">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">{card.title}</CardTitle>
                                  <CardDescription className="text-sm text-gray-500">
                                    {card.company_name} - {card.business_type}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm">
                                  {card.value && <p className="font-medium text-green-600">Valor: R$ {card.value.toFixed(2)}</p>}
                                  {card.description && <p className="text-gray-600 mt-1">{card.description}</p>}
                                  {card.closed_at && <p className="text-gray-500 mt-1">Fechamento: {format(new Date(card.closed_at), 'dd/MM/yyyy')}</p>}
                                  {card.tasks && card.tasks.length > 0 && (
                                    <div className="mt-2">
                                      <h4 className="font-semibold text-gray-700">Tarefas:</h4>
                                      <ul className="list-disc list-inside text-gray-600">
                                        {card.tasks.map((task) => (
                                          <li key={task.id} className={`flex items-center ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                            <input
                                              type="checkbox"
                                              checked={task.completed}
                                              onChange={() => handleToggleTaskCompletion(task.id)}
                                              className="mr-2"
                                            />
                                            {task.text}
                                            {task.due_date && <span className="ml-2 text-xs text-gray-500">({format(new Date(task.due_date), 'dd/MM')})</span>}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  <div className="flex justify-end space-x-2 mt-3">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenCardModal(stage.id, card)}>
                                      <Edit className="h-4 w-4 text-gray-500" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCard(card.id)}>
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </ShadcnCard>
                            </DraggableCard>
                          ))}
                        </SortableContext>
                      </div>
                      <Button
                        onClick={() => handleOpenCardModal(stage.id)}
                        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Card
                      </Button>
                    </div>
                  </DraggableStage>
                ))}
              </SortableContext>
              <div className="w-80 flex-shrink-0">
                <Button
                  onClick={() => {
                    setEditingStage(null);
                    setNewStageName("");
                    setIsStageModalOpen(true);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white h-full min-h-[150px] flex items-center justify-center flex-col border-2 border-dashed border-purple-300 rounded-lg"
                >
                  <PlusCircle className="h-8 w-8 mb-2" />
                  Adicionar Estágio
                </Button>
              </div>
            </div>
          </DndContext>
        </div>
      )}

      {/* Funnel Modal */}
      <Dialog open={isFunnelModalOpen} onOpenChange={setIsFunnelModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Funil</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="funnelName" className="text-right">
                Nome
              </Label>
              <Input
                id="funnelName"
                value={newFunnelName}
                onChange={(e) => setNewFunnelName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateFunnel}>Criar Funil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stage Modal */}
      <Dialog open={isStageModalOpen} onOpenChange={setIsStageModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingStage ? "Editar Estágio" : "Novo Estágio"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stageName" className="text-right">
                Nome
              </Label>
              <Input
                id="stageName"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={editingStage ? handleUpdateStage : handleCreateStage}>
              {editingStage ? "Salvar Alterações" : "Criar Estágio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card Modal */}
      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCard ? "Editar Card" : "Novo Card"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={cardForm.title || ""}
                onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={cardForm.description || ""}
                onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Valor
              </Label>
              <Input
                id="value"
                type="number"
                value={cardForm.value || ""}
                onChange={(e) => setCardForm({ ...cardForm, value: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">
                Origem
              </Label>
              <Input
                id="source"
                value={cardForm.source || ""}
                onChange={(e) => setCardForm({ ...cardForm, source: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company_name" className="text-right">
                Empresa
              </Label>
              <Input
                id="company_name"
                value={cardForm.company_name || ""}
                onChange={(e) => setCardForm({ ...cardForm, company_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="business_type" className="text-right">
                Tipo de Negócio
              </Label>
              <Input
                id="business_type"
                value={cardForm.business_type || ""}
                onChange={(e) => setCardForm({ ...cardForm, business_type: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="closed_at" className="text-right">
                Data de Fechamento
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!cardForm.closed_at && "text-muted-foreground"
                      } col-span-3`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {cardForm.closed_at ? format(new Date(cardForm.closed_at), "PPP") : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={cardForm.closed_at ? new Date(cardForm.closed_at) : undefined}
                    onSelect={(date) => setCardForm({ ...cardForm, closed_at: date ? format(date, 'yyyy-MM-dd') : undefined })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Tasks Section */}
            <div className="col-span-4">
              <h3 className="text-lg font-semibold mb-2">Tarefas</h3>
              <div className="space-y-2">
                {(cardForm.tasks || []).map((task) => (
                  <div key={task.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTaskCompletion(task.id)}
                        className="mr-2"
                      />
                      <span className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.text}
                        {task.due_date && <span className="ml-2 text-xs text-gray-500">({format(new Date(task.due_date), 'dd/MM/yyyy')})</span>}
                        {task.priority && <span className={`ml-2 text-xs font-medium ${task.priority === 'high' ? 'text-red-600' : task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>({task.priority})</span>}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveTask(task.id)}>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Input
                  placeholder="Nova tarefa"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="flex-1"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className="w-auto justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTaskDueDate ? format(newTaskDueDate, "PPP") : <span>Data de Vencimento</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTaskDueDate}
                      onSelect={setNewTaskDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Select value={newTaskPriority} onValueChange={(value) => setNewTaskPriority(value as 'low' | 'medium' | 'high')}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddTask}>Adicionar</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveCard}>Salvar Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}