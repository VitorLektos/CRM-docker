"use client";

import * as React from "react";
import { Card as CardUI, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";

interface CardKanbanProps {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  tasksCount?: number;
  tasksDoneCount?: number;
  onClick?: () => void;
}

export function CardKanban({
  id,
  title,
  description,
  assignedTo,
  tasksCount = 0,
  tasksDoneCount = 0,
  onClick,
}: CardKanbanProps) {
  return (
    <CardUI
      className="cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      draggable
      onClick={onClick}
      data-card-id={id}
    >
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {assignedTo && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            <User size={14} />
            <span>{assignedTo}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        {description && <CardDescription>{description}</CardDescription>}
        <div className="mt-2 text-xs">
          Tarefas: {tasksDoneCount} / {tasksCount}
        </div>
      </CardContent>
    </CardUI>
  );
}