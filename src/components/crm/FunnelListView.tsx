"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function FunnelListView({ cards, stages, onCardClick }: any) {
  const getStageName = (stageId: string) => {
    return stages.find((s: any) => s.id === stageId)?.name || "N/A";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título do Card</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Tarefas</TableHead>
            <TableHead>Data de Criação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card: any) => (
            <TableRow key={card.id} onClick={() => onCardClick(card.id)} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-medium">{card.title}</TableCell>
              <TableCell>
                <Badge variant="secondary">{getStageName(card.stageId)}</Badge>
              </TableCell>
              <TableCell>{formatCurrency(card.value)}</TableCell>
              <TableCell>{`${card.tasksDoneCount} / ${card.tasksCount}`}</TableCell>
              <TableCell>{formatDate(card.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}