"use client";

import * as React from "react";
import { CardKanban } from "./CardKanban";

interface FunnelColumnProps {
  stageId: string;
  stageName: string;
  cards: Array<{
    id: string;
    title: string;
    description?: string;
    assignedTo?: string;
    tasksCount?: number;
    tasksDoneCount?: number;
  }>;
  onCardClick?: (cardId: string) => void;
  onDropCard?: (cardId: string, newStageId: string) => void;
}

export function FunnelColumn({
  stageId,
  stageName,
  cards,
  onCardClick,
  onDropCard,
}: FunnelColumnProps) {
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    if (cardId && onDropCard) {
      onDropCard(cardId, stageId);
    }
  };

  return (
    <div
      className="flex flex-col bg-muted rounded-md p-2 w-72 max-h-[80vh] overflow-y-auto"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <h3 className="font-semibold mb-2">{stageName}</h3>
      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={card.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", card.id)}
          >
            <CardKanban
              id={card.id}
              title={card.title}
              description={card.description}
              assignedTo={card.assignedTo}
              tasksCount={card.tasksCount}
              tasksDoneCount={card.tasksDoneCount}
              onClick={() => onCardClick && onCardClick(card.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}