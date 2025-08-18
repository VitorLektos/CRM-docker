"use client";

import React from 'react';
import TasksCalendar from '@/components/TasksCalendar';
import GoalsManager from '@/components/GoalsManager';

const Index: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral: tarefas e metas</p>
      </header>
      <div className="grid grid-cols-1 gap-6">
        <TasksCalendar />
        <GoalsManager />
      </div>
    </div>
  );
};

export default Index;