export interface Funnel {
  id: string;
  name: string;
  created_at: string;
  created_by?: string;
}

export interface Stage {
  id: string;
  funnel_id: string;
  name: string;
  position: number;
  created_at: string;
  created_by?: string;
}

export interface Card {
  id: string;
  stage_id: string;
  contact_id?: string;
  title: string;
  description?: string;
  value?: number;
  source?: string;
  company_name?: string;
  business_type?: string;
  created_by?: string;
  created_at: string;
  closed_at?: string;
  tasks?: any[]; // Consider defining a more specific type for tasks if needed
}