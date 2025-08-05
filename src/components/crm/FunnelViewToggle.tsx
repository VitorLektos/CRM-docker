"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface FunnelViewToggleProps {
  viewMode: 'kanban' | 'list';
  setViewMode: (mode: 'kanban' | 'list') => void;
}

export function FunnelViewToggle({ viewMode, setViewMode }: FunnelViewToggleProps) {
  return (
    <div className="flex items-center rounded-md bg-muted p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('kanban')}
        className={cn("h-8 w-8 p-0", viewMode === 'kanban' && 'bg-background text-primary shadow-sm')}
        aria-label="Visualização Kanban"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('list')}
        className={cn("h-8 w-8 p-0", viewMode === 'list' && 'bg-background text-primary shadow-sm')}
        aria-label="Visualização em Lista"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}