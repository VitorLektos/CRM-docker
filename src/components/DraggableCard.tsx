"use client";

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from './ui/card';
import { Card as CardType } from '../types';

interface DraggableCardProps {
  card: CardType;
  index: number;
  contactName?: string;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ card, index, contactName }) => {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided) => (
        <ShadcnCard
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3 bg-white shadow-sm rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
        >
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium text-gray-800">{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 text-xs text-gray-600 space-y-1">
            {card.company_name && <p className="font-semibold text-gray-700">{card.company_name}</p>}
            {contactName && <p className="text-blue-600">{contactName}</p>}
            {typeof card.value === 'number' && (
              <p className="font-bold text-green-700">
                R$ {card.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
          </CardContent>
        </ShadcnCard>
      )}
    </Draggable>
  );
};

export default DraggableCard;