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

interface CreateStageDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreate: (stageName: string) => void;
}

export function CreateStageDialog({ isOpen, onOpenChange, onCreate }: CreateStageDialogProps) {
  const [name, setName] = React.useState("");

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim());
      setName("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Estágio</DialogTitle>
          <DialogDescription>
            Dê um nome para o novo estágio do funil.
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
              placeholder="Ex: Qualificação"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreate}>Adicionar Estágio</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}