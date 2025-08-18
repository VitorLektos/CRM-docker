export interface Funnel {
  id: string;
  name: string;
  created_at: string;
  created_by?: string | null;
}

export interface Stage {
  id: string;
  funnel_id: string;
  name: string;
  position: number;
  created_at: string;
  created_by?: string | null;
}

export interface Card {
  id: string;
  stage_id: string;
  contact_id?: string | null;
  title: string;
  description?: string | null;
  value?: number | null;
  source?: string | null;
  company_name?: string | null;
  business_type?: string | null;
  created_by?: string | null;
  created_at: string;
  closed_at?: string | null;
  tasks?: any[]; // Mantido como any[] pois a tabela tasks é separada
}

export interface Contact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  industry?: string | null;
  company_url?: string | null;
  address?: string | null;
  created_by?: string | null;
  created_at: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | string;

export interface Task {
  id: string;
  card_id: string;
  text: string;
  completed?: boolean | null;
  due_date?: string | null; // date
  priority?: TaskPriority | null;
  created_by?: string | null;
  created_at: string;
}

export interface Goal {
  id: number;
  month: number;
  year: number;
  goal_amount: number;
  set_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}