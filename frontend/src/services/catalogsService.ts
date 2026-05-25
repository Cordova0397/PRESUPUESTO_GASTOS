import type { CostCenter, CostCenterCreatePayload, CostCenterUpdatePayload } from "../types/costCenter";
import type { ExpenseConcept, ExpenseConceptCreatePayload, ExpenseConceptUpdatePayload } from "../types/expenseConcept";
import { ApiError, apiFetch } from "./apiClient";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://127.0.0.1:8000";

async function apiRequest<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    let detail = "";
    try {
      const data = await response.json();
      detail = typeof data?.detail === "string" ? data.detail : JSON.stringify(data);
    } catch {
      detail = `Error HTTP ${response.status}`;
    }
    throw new ApiError(response.status, detail || `Error HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

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

export function createCostCenter(payload: CostCenterCreatePayload): Promise<CostCenter> {
  return apiRequest<CostCenter>("/api/cost-centers", "POST", payload);
}

export function updateCostCenter(
  id: number,
  payload: CostCenterUpdatePayload,
): Promise<CostCenter> {
  return apiRequest<CostCenter>(`/api/cost-centers/${id}`, "PUT", payload);
}

export function deleteCostCenter(
  id: number,
): Promise<{ ok: boolean; message: string; id: number }> {
  return apiRequest<{ ok: boolean; message: string; id: number }>(
    `/api/cost-centers/${id}`,
    "DELETE",
  );
}

export function createExpenseConcept(
  costCenterId: number,
  payload: ExpenseConceptCreatePayload,
): Promise<ExpenseConcept> {
  return apiRequest<ExpenseConcept>(
    `/api/cost-centers/${costCenterId}/expense-concepts`,
    "POST",
    payload,
  );
}

export function updateExpenseConcept(
  costCenterId: number,
  expenseConceptId: number,
  payload: ExpenseConceptUpdatePayload,
): Promise<ExpenseConcept> {
  return apiRequest<ExpenseConcept>(
    `/api/cost-centers/${costCenterId}/expense-concepts/${expenseConceptId}`,
    "PUT",
    payload,
  );
}

export function deleteExpenseConcept(
  costCenterId: number,
  expenseConceptId: number,
): Promise<{ ok: boolean; message: string; id: number }> {
  return apiRequest<{ ok: boolean; message: string; id: number }>(
    `/api/cost-centers/${costCenterId}/expense-concepts/${expenseConceptId}`,
    "DELETE",
  );
}
