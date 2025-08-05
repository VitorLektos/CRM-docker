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
import { TaskPriority } from "@/data/sample-data";
import { cn } from "@/lib/utils";

interface TaskEvent {
  title: string;
  extendedProps: {
    cardTitle: string;
    cardId: string;
    priority?: TaskPriority;
  };
}

interface DayTasksDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  date: Date | null;
  tasks: TaskEvent[];
  onTaskClick: (cardId: string) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  "Urgente": "bg-red-500 text-white",
  "Alta": "bg-orange-500 text-white",
  "Média": "bg-yellow-400 text-black",
  "Baixa": "bg-blue-500 text-white",
};

export function DayTasksDialog({ isOpen, onOpenChange, date, tasks, onTaskClick }: DayTasksDialogProps) {
  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Tarefas para {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogTitle>
          <DialogDescription>
            {tasks.length > 0 ? `Você tem ${tasks.length} tarefa(s) para este dia.` : "Nenhuma tarefa para este dia."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {tasks.map((task, index) => (
            <div 
              key={index} 
              className="p-3 rounded-md border bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => onTaskClick(task.extendedProps.cardId)}
            >
              <div className="flex justify-between items-start">
                <p className="font-medium">{task.title}</p>
                {task.extendedProps.priority && (
                  <Badge className={cn(priorityColors[task.extendedProps.priority])}>
                    {task.extendedProps.priority}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Card: <Badge variant="secondary">{task.extendedProps.cardTitle}</Badge>
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}