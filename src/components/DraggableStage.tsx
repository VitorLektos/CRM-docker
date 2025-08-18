"use client";

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { Stage } from '../types/index'; // Caminho de importação ajustado

interface DraggableStageProps {
  stage: Stage;
  index: number;
  onEditStage: (stage: Stage) => void;
  onDeleteStage: (stageId: string) => void;
  onAddCard: (stageId: string) => void;
  children: React.ReactNode;
}

const DraggableStage: React.FC<DraggableStageProps> = ({
  stage,
  index,
  onEditStage,
  onDeleteStage,
  onAddCard,
  children,
}) => {
  return (
    <Draggable draggableId={stage.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex flex-col w-80 bg-gray-100 rounded-lg shadow-md p-4 mr-4 flex-shrink-0"
        >
          <div className="flex justify-between items-center mb-4" {...provided.dragHandleProps}>
            <h3 className="text-lg font-semibold text-gray-800">{stage.name}</h3>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditStage(stage)}
                className="text-gray-500 hover:text-blue-600"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteStage(stage.id)}
                className="text-gray-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
            {children}
          </div>
          <Button
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onAddCard(stage.id)}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Card
          </Button>
        </div>
      )}
    </Draggable>
  );
};

export default DraggableStage;