"use client";

import * as React from "react";
import { FunnelColumn } from "./FunnelColumn";

interface Card {
  id: string;
  title: string;
  contactName?: string;
  tasksCount?: number;
  tasksDoneCount?: number;
  stageId: string;
}

interface Stage {
  id: string;
  name: string;
  color: { bg: string; text: string };
}

interface FunnelBoardProps {
  stages: Stage[];
  cards: Card[];
  onCardClick?: (cardId: string) => void;
  onCardMove?: (cardId: string, newStageId: string) => void;
}

export function FunnelBoard({ stages, cards, onCardClick, onCardMove }: FunnelBoardProps) {
  const handleDropCard = (cardId: string, newStageId: string) => {
    if (onCardMove) {
      onCardMove(cardId, newStageId);
    }
  };

  return (
    <div className="flex space-x-4 overflow-x-auto p-4">
      {stages.map((stage) => (
        <FunnelColumn
          key={stage.id}
          stageId={stage.id}
          stageName={stage.name}
          stageColor={stage.color}
          cards={cards.filter((card) => card.stageId === stage.id)}
          onCardClick={onCardClick}
          onDropCard={handleDropCard}
        />
      ))}
    </div>
  );
}