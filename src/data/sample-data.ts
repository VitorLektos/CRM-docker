"use client";

// Interfaces
export interface HistoryEntry {
  id: string;
  date: string;
  description: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface CardData {
  id: string;
  title: string;
  companyName?: string;
  businessType?: string;
  description?: string;
  contactId?: string;
  tasks: Task[];
  stageId: string;
  value: number;
  source?: string;
  createdAt: string;
  history: HistoryEntry[];
}

export interface Stage {
  id: string;
  name: string;
  funnelId: string;
  color: { bg: string; text: string };
}

export interface Funnel {
  id: string;
  name: string;
}

// Sample Data
export const sampleContacts: Contact[] = [
    { id: 'contact-1', name: 'João Silva', email: 'joao.silva@example.com', phone: '(11) 98765-4321' },
    { id: 'contact-2', name: 'Maria Oliveira', email: 'maria.o@example.com', phone: '(21) 91234-5678' },
    { id: 'contact-3', name: 'Pedro Santos', email: 'pedro.santos@example.com', phone: '(31) 95555-5555' },
    { id: 'contact-4', name: 'Ana Costa', email: 'ana.costa@example.com', phone: '(41) 94444-4444' },
];

export const stageColorStyles = [
    { bg: "bg-sky-100", text: "text-sky-800" },
    { bg: "bg-green-100", text: "text-green-800" },
    { bg: "bg-amber-100", text: "text-amber-800" },
    { bg: "bg-rose-100", text: "text-rose-800" },
    { bg: "bg-indigo-100", text: "text-indigo-800" },
    { bg: "bg-teal-100", text: "text-teal-800" },
];

export const sampleFunnels: Funnel[] = [
  { id: "funnel-1", name: "Funil de Vendas" },
  { id: "funnel-2", name: "Funil de Marketing" },
];

export const sampleStages: Stage[] = [
  { id: "stage-1", name: "Novo", funnelId: "funnel-1", color: stageColorStyles[0] },
  { id: "stage-2", name: "Contato Feito", funnelId: "funnel-1", color: stageColorStyles[1] },
  { id: "stage-3", name: "Proposta", funnelId: "funnel-1", color: stageColorStyles[2] },
  { id: "stage-4", name: "Fechado", funnelId: "funnel-1", color: stageColorStyles[3] },
  { id: "stage-5", name: "Lead", funnelId: "funnel-2", color: stageColorStyles[4] },
  { id: "stage-6", name: "MQL", funnelId: "funnel-2", color: stageColorStyles[5] },
  { id: "stage-7", name: "SQL", funnelId: "funnel-2", color: stageColorStyles[0] },
];

export const sampleCards: CardData[] = [
  { id: "card-1", title: "Contato João", companyName: "Tech Solutions", businessType: "SaaS", description: "Interessado no produto X", contactId: "contact-1", tasks: [{id: 'task-1', text: 'Follow-up call', completed: false, dueDate: '2024-09-10'}], stageId: "stage-1", value: 1500, source: "Indicação", createdAt: new Date(2024, 7, 1).toISOString(), history: [{ id: 'hist-1', date: new Date(2024, 7, 1).toISOString(), description: 'Card criado.' }] },
  { id: "card-2", title: "Contato Ana", companyName: "Inova Corp", businessType: "Consultoria", description: "Aguardando resposta", contactId: "contact-4", tasks: [{id: 'task-2', text: 'Enviar proposta', completed: true}, {id: 'task-3', text: 'Agendar reunião', completed: false}], stageId: "stage-2", value: 3200, source: "Website", createdAt: new Date(2024, 6, 28).toISOString(), history: [{ id: 'hist-2', date: new Date(2024, 6, 28).toISOString(), description: 'Card criado.' }] },
  { id: "card-3", title: "Lead do Ebook", companyName: "Marketing Digital BR", businessType: "Agência", description: "Baixou o ebook de marketing", contactId: "contact-3", tasks: [], stageId: "stage-5", value: 500, source: "Marketing de Conteúdo", createdAt: new Date(2024, 7, 5).toISOString(), history: [{ id: 'hist-3', date: new Date(2024, 7, 5).toISOString(), description: 'Card criado.' }] },
];