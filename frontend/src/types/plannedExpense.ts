export type PlannedExpense = {
  id: number;
  year: number;
  month: number;
  cost_center_id: number;
  expense_concept_id: number;
  amount: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  cost_center_code?: string | null;
  cost_center_name?: string | null;
  expense_concept_code?: string | null;
  expense_concept_name?: string | null;
};

export type PlannedExpenseCreatePayload = {
  year: number;
  month: number;
  cost_center_id: number;
  expense_concept_id: number;
  amount: string;
  notes?: string | null;
};

export type PlannedExpensePatchPayload = {
  amount?: string;
  notes?: string | null;
};
