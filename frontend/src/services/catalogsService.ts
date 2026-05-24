import type { CostCenter } from "../types/costCenter";
import type { ExpenseConcept } from "../types/expenseConcept";
import { apiFetch } from "./apiClient";

export function getActiveCostCenters(): Promise<CostCenter[]> {
  return apiFetch<CostCenter[]>("/api/cost-centers?is_active=true");
}

export function getActiveExpenseConceptsByCostCenter(
  costCenterId: number,
): Promise<ExpenseConcept[]> {
  return apiFetch<ExpenseConcept[]>(
    `/api/cost-centers/${costCenterId}/expense-concepts?is_active=true`,
  );
}
