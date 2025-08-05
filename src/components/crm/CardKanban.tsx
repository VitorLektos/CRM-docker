"use client";

import * as React from "react";
import { Card as CardUI, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardKanbanProps {
  id: string;
  title: string;
  contactName?: string;
  tasksCount?: number;
  tasksDoneCount?: number;
  status?: "default" | "due" | "overdue";
  onClick?: () => void;
}

export function CardKanban({
  id,
  title,
  contactName,
  tasksCount = 0,
  tasksDoneCount = 0,
  status = "default",
  onClick,
}: CardKanbanProps) {
  const statusClasses = {
    default: "bg-card",
    due: "bg-card border-2 border-orange-400",
    overdue: "bg-red-200",
  };

  const titleStatusClasses = {
    default: "font-semibold",
    due: "font-bold text-orange-600",
    overdue: "font-bold text-black",
  };

  const textStatusClasses = {
      default: "text-muted-foreground",
      due: "text-muted-foreground",
      overdue: "text-black",
  }

  return (
    <CardUI
      className={cn(
        "cursor-pointer shadow-sm hover:shadow-md transition-shadow",
        statusClasses[status]
      )}
      draggable
      onClick={onClick}
      data-card-id={id}
    >
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-sm", titleStatusClasses[status])}>{title}</CardTitle>
        {contactName && (
          <div className={cn("flex items-center space-x-1 text-xs mt-1", textStatusClasses[status])}>
            <User size={14} />
            <span>{contactName}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className={cn("text-xs", textStatusClasses[status])}>
        {tasksCount > 0 && (
          <div className="mt-2 text-xs">
            Tarefas: {tasksDoneCount} / {tasksCount}
          </div>
        )}
      </CardContent>
    </CardUI>
  );
}