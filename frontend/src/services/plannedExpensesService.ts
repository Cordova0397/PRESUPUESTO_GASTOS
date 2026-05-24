import type {
  PlannedExpense,
  PlannedExpenseCreatePayload,
  PlannedExpensePatchPayload,
} from "../types/plannedExpense";
import { ApiError } from "./apiClient";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://127.0.0.1:8000";

async function apiMutate<T>(
  path: string,
  method: "POST" | "PATCH",
  body: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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

export type GetPlannedExpensesParams = {
  year: number;
  cost_center_id: number;
};

const PAGE_LIMIT = 200;

async function fetchPlannedExpensesPage(
  params: GetPlannedExpensesParams,
  skip: number,
): Promise<PlannedExpense[]> {
  const qs = new URLSearchParams({
    year: String(params.year),
    cost_center_id: String(params.cost_center_id),
    limit: String(PAGE_LIMIT),
    skip: String(skip),
  });
  const response = await fetch(`${API_BASE_URL}/api/planned-expenses?${qs.toString()}`);
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
  return response.json() as Promise<PlannedExpense[]>;
}

export async function getPlannedExpenses(
  params: GetPlannedExpensesParams,
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
  return apiMutate<PlannedExpense>("/api/planned-expenses", "POST", payload);
}

export function patchPlannedExpense(
  id: number,
  payload: PlannedExpensePatchPayload,
): Promise<PlannedExpense> {
  return apiMutate<PlannedExpense>(`/api/planned-expenses/${id}`, "PATCH", payload);
}
