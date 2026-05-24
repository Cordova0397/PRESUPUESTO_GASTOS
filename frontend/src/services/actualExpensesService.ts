import type {
  ActualExpense,
  ActualExpenseCreatePayload,
  ActualExpensesFilters,
  ActualExpenseUpdatePayload,
} from "../types/actualExpense";
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

const PAGE_LIMIT = 200;

async function fetchActualExpensesPage(
  filters: ActualExpensesFilters,
  skip: number,
): Promise<ActualExpense[]> {
  const params: Record<string, string> = {
    limit: String(PAGE_LIMIT),
    skip: String(skip),
  };
  if (filters.year !== undefined) params.year = String(filters.year);
  if (filters.month !== undefined) params.month = String(filters.month);
  if (filters.cost_center_id !== undefined)
    params.cost_center_id = String(filters.cost_center_id);
  if (filters.expense_concept_id !== undefined)
    params.expense_concept_id = String(filters.expense_concept_id);
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.search?.trim()) params.search = filters.search.trim();

  const qs = new URLSearchParams(params);
  const response = await fetch(
    `${API_BASE_URL}/api/actual-expenses?${qs.toString()}`,
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
  return response.json() as Promise<ActualExpense[]>;
}

export async function getActualExpenses(
  filters: ActualExpensesFilters,
): Promise<ActualExpense[]> {
  const all: ActualExpense[] = [];
  let skip = 0;
  while (true) {
    const page = await fetchActualExpensesPage(filters, skip);
    all.push(...page);
    if (page.length < PAGE_LIMIT) break;
    skip += PAGE_LIMIT;
  }
  return all;
}

export function createActualExpense(
  payload: ActualExpenseCreatePayload,
): Promise<ActualExpense> {
  return apiRequest<ActualExpense>("/api/actual-expenses", "POST", payload);
}

export function updateActualExpense(
  id: number,
  payload: ActualExpenseUpdatePayload,
): Promise<ActualExpense> {
  return apiRequest<ActualExpense>(`/api/actual-expenses/${id}`, "PUT", payload);
}

export function deleteActualExpense(
  id: number,
): Promise<{ ok: boolean; message: string; id: number }> {
  return apiRequest<{ ok: boolean; message: string; id: number }>(
    `/api/actual-expenses/${id}`,
    "DELETE",
  );
}
