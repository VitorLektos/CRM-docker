"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskEvent {
  title: string;
  extendedProps: {
    cardTitle: string;
    cardId: string;
  };
}

interface DayTasksDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  date: Date | null;
  tasks: TaskEvent[];
}

export function DayTasksDialog({ isOpen, onOpenChange, date, tasks }: DayTasksDialogProps) {
  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Tarefas para {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogTitle>
          <DialogDescription>
            {tasks.length > 0 ? `Você tem ${tasks.length} tarefa(s) para este dia.` : "Nenhuma tarefa para este dia."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {tasks.map((task, index) => (
            <div key={index} className="p-3 rounded-md border bg-muted/50">
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-muted-foreground">
                Card: <Badge variant="secondary">{task.extendedProps.cardTitle}</Badge>
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}