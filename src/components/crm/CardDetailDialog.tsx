"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "lucide-react";

interface Card {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  tasksCount?: number;
  tasksDoneCount?: number;
  stageId: string;
}

interface CardDetailDialogProps {
  card: Card | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function CardDetailDialog({ card, isOpen, onOpenChange }: CardDetailDialogProps) {
  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{card.title}</DialogTitle>
          {card.description && (
            <DialogDescription>{card.description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4 space-y-4">
          {card.assignedTo && (
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Responsável:</span>
              <span>{card.assignedTo}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-semibold">Tarefas:</span>
            <span>{card.tasksDoneCount} de {card.tasksCount} concluídas</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}