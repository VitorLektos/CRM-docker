"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function SortableStageItem({ id, onRemove }: { id: string; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center w-full">
      <div className="flex items-center justify-between gap-1 w-full p-2 rounded-md bg-secondary">
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab focus:outline-none p-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-secondary-foreground">{id}</span>
        </div>
        <button onClick={() => onRemove(id)} className="rounded-full hover:bg-muted-foreground/20 p-1">
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

interface CreateFunnelDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreate: (funnelName: string, stageNames: string[]) => void;
}

export function CreateFunnelDialog({ isOpen, onOpenChange, onCreate }: CreateFunnelDialogProps) {
  const [name, setName] = React.useState("");
  const [stageName, setStageName] = React.useState("");
  const [stages, setStages] = React.useState<string[]>(["Novo", "Contato Feito", "Proposta", "Fechado"]);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddStage = () => {
    if (stageName.trim() && !stages.includes(stageName.trim())) {
      setStages([...stages, stageName.trim()]);
      setStageName("");
    }
  };

  const handleRemoveStage = (stageToRemove: string) => {
    setStages(stages.filter((stage) => stage !== stageToRemove));
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast({
        title: "Nome do funil é obrigatório",
        description: "Por favor, insira um nome para o funil antes de criar.",
        variant: "destructive",
      });
      return;
    }
    if (stages.length === 0) {
      toast({
        title: "Funil precisa de estágios",
        description: "Por favor, adicione pelo menos um estágio ao funil.",
        variant: "destructive",
      });
      return;
    }
    
    onCreate(name.trim(), stages);
    onOpenChange(false);
  };
  
  React.useEffect(() => {
    if (!isOpen) {
      setName("");
      setStageName("");
      setStages(["Novo", "Contato Feito", "Proposta", "Fechado"]);
    }
  }, [isOpen]);

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setStages((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Novo Funil</DialogTitle>
          <DialogDescription>
            Dê um nome para o seu novo funil e defina os estágios. Você pode reordenar os estágios arrastando-os.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Ex: Funil de Vendas"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stage-name" className="text-right">
              Estágios
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="stage-name"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="Nome do estágio"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStage();
                  }
                }}
              />
              <Button type="button" onClick={handleAddStage}>Adicionar</Button>
            </div>
          </div>
          <div className="col-start-2 col-span-3 flex flex-col gap-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={stages}
                strategy={verticalListSortingStrategy}
              >
                {stages.map((stage) => (
                  <SortableStageItem key={stage} id={stage} onRemove={handleRemoveStage} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreate}>
            Criar Funil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}