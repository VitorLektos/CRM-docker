"use client";

import * as React from "react";
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
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CreateFunnelDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreate: (funnelName: string, stageNames: string[]) => void;
}

export function CreateFunnelDialog({ isOpen, onOpenChange, onCreate }: CreateFunnelDialogProps) {
  const [name, setName] = React.useState("");
  const [stageName, setStageName] = React.useState("");
  const [stages, setStages] = React.useState<string[]>(["Novo", "Contato Feito", "Proposta", "Fechado"]);

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
    if (name.trim() && stages.length > 0) {
      onCreate(name.trim(), stages);
      setName("");
      setStages(["Novo", "Contato Feito", "Proposta", "Fechado"]);
      onOpenChange(false);
    }
  };
  
  React.useEffect(() => {
    if (!isOpen) {
      setName("");
      setStageName("");
      setStages(["Novo", "Contato Feito", "Proposta", "Fechado"]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Novo Funil</DialogTitle>
          <DialogDescription>
            Dê um nome para o seu novo funil e defina os estágios iniciais.
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
          <div className="col-start-2 col-span-3 flex flex-wrap gap-2">
            {stages.map((stage) => (
              <Badge key={stage} variant="secondary" className="flex items-center gap-1">
                {stage}
                <button onClick={() => handleRemoveStage(stage)} className="rounded-full hover:bg-muted-foreground/20">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreate} disabled={!name.trim() || stages.length === 0}>
            Criar Funil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}