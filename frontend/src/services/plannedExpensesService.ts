import type {
  PlannedExpense,
  PlannedExpenseCreatePayload,
  PlannedExpenseUpdatePayload,
} from "../types/plannedExpense";
import { ApiError } from "./apiClient";

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
      detail =
        typeof data?.detail === "string" ? data.detail : JSON.stringify(data);
    } catch {
      detail = `Error HTTP ${response.status}`;
    }
    throw new ApiError(response.status, detail || `Error HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export type GetPlannedExpensesParams = {
  year?: number;
  month?: number;
  cost_center_id?: number;
  expense_concept_id?: number;
};

const PAGE_LIMIT = 200;

async function fetchPlannedExpensesPage(
  params: GetPlannedExpensesParams,
  skip: number,
): Promise<PlannedExpense[]> {
  const qsParams: Record<string, string> = {
    limit: String(PAGE_LIMIT),
    skip: String(skip),
  };
  if (params.year !== undefined) qsParams.year = String(params.year);
  if (params.month !== undefined) qsParams.month = String(params.month);
  if (params.cost_center_id !== undefined)
    qsParams.cost_center_id = String(params.cost_center_id);
  if (params.expense_concept_id !== undefined)
    qsParams.expense_concept_id = String(params.expense_concept_id);

  const qs = new URLSearchParams(qsParams);
  const response = await fetch(
    `${API_BASE_URL}/api/planned-expenses?${qs.toString()}`,
  );
  if (!response.ok) {
    let detail = "";
    try {
      const data = await response.json();
      detail =
        typeof data?.detail === "string" ? data.detail : JSON.stringify(data);
    } catch {
      detail = `Error HTTP ${response.status}`;
    }
    throw new ApiError(response.status, detail || `Error HTTP ${response.status}`);
  }
  return response.json() as Promise<PlannedExpense[]>;
}

export async function getPlannedExpenses(
  params: GetPlannedExpensesParams = {},
): Promise<PlannedExpense[]> {
  const all: PlannedExpense[] = [];
  let skip = 0;
  while (true) {
    const page = await fetchPlannedExpensesPage(params, skip);
    all.push(...page);
    if (page.length < PAGE_LIMIT) break;
    skip += PAGE_LIMIT;
  }
  return all;
}

export function createPlannedExpense(
  payload: PlannedExpenseCreatePayload,
): Promise<PlannedExpense> {
  return apiRequest<PlannedExpense>("/api/planned-expenses", "POST", payload);
}

export function updatePlannedExpense(
  id: number,
  payload: PlannedExpenseUpdatePayload,
): Promise<PlannedExpense> {
  return apiRequest<PlannedExpense>(`/api/planned-expenses/${id}`, "PUT", payload);
}

export function deletePlannedExpense(
  id: number,
): Promise<{ ok: boolean; message: string; id: number }> {
  return apiRequest<{ ok: boolean; message: string; id: number }>(
    `/api/planned-expenses/${id}`,
    "DELETE",
  );
}
