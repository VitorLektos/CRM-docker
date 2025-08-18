"use client";

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from './ui/card';
import { Card as CardType } from '../types/index'; // Caminho de importação ajustado

interface DraggableCardProps {
  card: CardType;
  index: number;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ card, index }) => {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided) => (
        <ShadcnCard
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3 bg-white shadow-sm rounded-lg border border-gray-200"
        >
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm font-medium text-gray-800">{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-xs text-gray-600">
            {card.description && <p className="mb-1">{card.description}</p>}
            {card.value && <p className="font-semibold">Valor: R$ {card.value.toFixed(2)}</p>}
            {card.company_name && <p>Empresa: {card.company_name}</p>}
          </CardContent>
        </ShadcnCard>
      )}
    </Draggable>
  );
};

export default DraggableCard;