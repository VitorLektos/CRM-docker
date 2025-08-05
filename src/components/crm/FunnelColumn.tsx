"use client";

import * as React from "react";
import { CardKanban } from "./CardKanban";

interface FunnelColumnProps {
  stageId: string;
  stageName: string;
  stageColor: { bg: string; text: string };
  cards: Array<{
    id: string;
    title: string;
    contactName?: string;
    tasksCount?: number;
    tasksDoneCount?: number;
    status?: "default" | "due" | "overdue";
  }>;
  onCardClick?: (cardId: string) => void;
  onDropCard?: (cardId: string, newStageId: string) => void;
  canMoveCards: boolean;
}

export function FunnelColumn({
  stageId,
  stageName,
  stageColor,
  cards,
  onCardClick,
  onDropCard,
  canMoveCards,
}: FunnelColumnProps) {
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (canMoveCards) {
      e.preventDefault();
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canMoveCards) return;
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    if (cardId && onDropCard) {
      onDropCard(cardId, stageId);
    }
  };

  return (
    <div
      className={`flex flex-col ${stageColor.bg} rounded-lg w-72 max-h-[80vh] flex-shrink-0`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <h3 className={`font-semibold p-3 ${stageColor.text}`}>
        {stageName}
      </h3>
      <div className="p-2 space-y-2 overflow-y-auto">
        {cards.map((card) => (
          <div
            key={card.id}
            draggable={canMoveCards}
            onDragStart={(e) => canMoveCards && e.dataTransfer.setData("text/plain", card.id)}
          >
            <CardKanban
              id={card.id}
              title={card.title}
              contactName={card.contactName}
              tasksCount={card.tasksCount}
              tasksDoneCount={card.tasksDoneCount}
              status={card.status}
              onClick={() => onCardClick && onCardClick(card.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}