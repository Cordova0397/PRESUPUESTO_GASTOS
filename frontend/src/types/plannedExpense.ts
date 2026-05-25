export type PlannedExpense = {
  id: number;
  planned_date: string;
  year: number;
  month: number;
  cost_center_id: number;
  expense_concept_id: number;
  amount: string;
  supplier: string | null;
  document_number: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  cost_center_code?: string | null;
  cost_center_name?: string | null;
  expense_concept_code?: string | null;
  expense_concept_name?: string | null;
};

export type PlannedExpenseCreatePayload = {
  planned_date: string;
  cost_center_id: number;
  expense_concept_id: number;
  amount: string;
  supplier?: string | null;
  document_number?: string | null;
  description?: string | null;
  notes?: string | null;
};

export type PlannedExpenseUpdatePayload = {
  planned_date: string;
  cost_center_id: number;
  expense_concept_id: number;
  amount: string;
  supplier?: string | null;
  document_number?: string | null;
  description?: string | null;
  notes?: string | null;
};
