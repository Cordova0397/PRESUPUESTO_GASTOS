import { useCallback, useEffect, useRef, useState } from "react";

import { PageHeader } from "../components/layout/PageHeader";
import { PlannedExpensesMatrix } from "../components/planned-expenses/PlannedExpensesMatrix";
import { PlannedExpensesToolbar } from "../components/planned-expenses/PlannedExpensesToolbar";
import { getActiveCostCenters, getActiveExpenseConceptsByCostCenter } from "../services/catalogsService";
import {
  createPlannedExpense,
  getPlannedExpenses,
  patchPlannedExpense,
} from "../services/plannedExpensesService";
import type { CostCenter } from "../types/costCenter";
import type { ExpenseConcept } from "../types/expenseConcept";
import type { PlannedExpense } from "../types/plannedExpense";
import { getCurrentYearInLima } from "../utils/date";
import { isValidMoneyInput, normalizeMoneyInput } from "../utils/money";

type CellKey = `${number}-${number}`;

function cellKey(conceptId: number, month: number): CellKey {
  return `${conceptId}-${month}`;
}

type LoadState = "idle" | "loading" | "error" | "ok";

export function PlannedExpensesPage() {
  const [year, setYear] = useState<number>(getCurrentYearInLima);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [selectedCostCenterId, setSelectedCostCenterId] = useState<number | null>(null);
  const [concepts, setConcepts] = useState<ExpenseConcept[]>([]);
  const [records, setRecords] = useState<PlannedExpense[]>([]);

  const [costCentersState, setCostCentersState] = useState<LoadState>("idle");
  const [conceptsState, setConceptsState] = useState<LoadState>("idle");
  const [recordsState, setRecordsState] = useState<LoadState>("idle");

  const [pendingValues, setPendingValues] = useState<Map<CellKey, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "ok" | "error"; text: string } | null>(
    null,
  );

  const saveMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showSaveMessage(type: "ok" | "error", text: string) {
    if (saveMessageTimer.current) clearTimeout(saveMessageTimer.current);
    setSaveMessage({ type, text });
    saveMessageTimer.current = setTimeout(() => setSaveMessage(null), 5000);
  }

  const loadCostCenters = useCallback(async () => {
    setCostCentersState("loading");
    try {
      const data = await getActiveCostCenters();
      setCostCenters(data);
      setCostCentersState("ok");
      if (data.length > 0 && selectedCostCenterId === null) {
        setSelectedCostCenterId(data[0].id);
      }
    } catch {
      setCostCentersState("error");
    }
  }, [selectedCostCenterId]);

  const loadConcepts = useCallback(async (costCenterId: number) => {
    setConceptsState("loading");
    setConcepts([]);
    try {
      const data = await getActiveExpenseConceptsByCostCenter(costCenterId);
      setConcepts(data);
      setConceptsState("ok");
    } catch {
      setConceptsState("error");
    }
  }, []);

  const loadRecords = useCallback(async (yr: number, costCenterId: number) => {
    setRecordsState("loading");
    setRecords([]);
    try {
      const data = await getPlannedExpenses({ year: yr, cost_center_id: costCenterId });
      setRecords(data);
      setRecordsState("ok");
    } catch {
      setRecordsState("error");
    }
  }, []);

  useEffect(() => {
    void loadCostCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCostCenterId === null) return;
    setPendingValues(new Map());
    void loadConcepts(selectedCostCenterId);
    void loadRecords(year, selectedCostCenterId);
  }, [year, selectedCostCenterId, loadConcepts, loadRecords]);

  function handleYearChange(newYear: number) {
    setYear(newYear);
    setPendingValues(new Map());
  }

  function handleCostCenterChange(id: number) {
    setSelectedCostCenterId(id);
    setPendingValues(new Map());
  }

  function handleCellChange(conceptId: number, month: number, value: string) {
    setPendingValues((prev) => {
      const next = new Map(prev);
      next.set(cellKey(conceptId, month), value);
      return next;
    });
    setSaveMessage(null);
  }

  function handleReload() {
    if (selectedCostCenterId === null) return;
    setPendingValues(new Map());
    void loadConcepts(selectedCostCenterId);
    void loadRecords(year, selectedCostCenterId);
  }

  const hasPendingChanges = pendingValues.size > 0;

  const hasErrors = Array.from(pendingValues.entries()).some(([key, value]) => {
    const [conceptIdStr, monthStr] = key.split("-");
    const conceptId = Number(conceptIdStr);
    const month = Number(monthStr);
    const existingRecord = records.find(
      (r) => r.expense_concept_id === conceptId && r.month === month,
    );
    const isEmpty = value.trim() === "";
    if (existingRecord && isEmpty) return true;
    if (!isEmpty && !isValidMoneyInput(value)) return true;
    return false;
  });

  async function handleSave() {
    if (!selectedCostCenterId || hasErrors || !hasPendingChanges) return;

    setIsSaving(true);
    setSaveMessage(null);

    const tasks: Promise<PlannedExpense>[] = [];
    let skipped = 0;

    for (const [key, rawValue] of pendingValues.entries()) {
      const [conceptIdStr, monthStr] = key.split("-");
      const conceptId = Number(conceptIdStr);
      const month = Number(monthStr);
      const existingRecord = records.find(
        (r) => r.expense_concept_id === conceptId && r.month === month,
      );
      const isEmpty = rawValue.trim() === "";

      if (existingRecord) {
        const normalized = normalizeMoneyInput(rawValue);
        if (normalized !== null) {
          tasks.push(patchPlannedExpense(existingRecord.id, { amount: normalized }));
        }
      } else {
        if (isEmpty) {
          skipped++;
          continue;
        }
        const normalized = normalizeMoneyInput(rawValue);
        if (normalized !== null) {
          tasks.push(
            createPlannedExpense({
              year,
              month,
              cost_center_id: selectedCostCenterId,
              expense_concept_id: conceptId,
              amount: normalized,
            }),
          );
        }
      }
    }

    try {
      await Promise.all(tasks);
      setPendingValues(new Map());
      await loadRecords(year, selectedCostCenterId);
      const savedCount = tasks.length;
      const msg =
        savedCount === 0
          ? skipped > 0
            ? "No hubo cambios para guardar."
            : "No hubo cambios para guardar."
          : `${savedCount} ${savedCount === 1 ? "registro guardado" : "registros guardados"} correctamente.`;
      showSaveMessage("ok", msg);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar.";
      showSaveMessage("error", message);
    } finally {
      setIsSaving(false);
    }
  }

  const isLoadingCostCenters = costCentersState === "loading";
  const isLoadingData = conceptsState === "loading" || recordsState === "loading";
  const errorCostCenters = costCentersState === "error";
  const errorData = conceptsState === "error" || recordsState === "error";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos planificados"
        description="Registro mensual de presupuesto por centro de costo y concepto."
      />

      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-panel">
        <div className="border-b border-slate-200 px-6 py-5">
          {isLoadingCostCenters ? (
            <div className="flex items-center gap-3">
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
              <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
            </div>
          ) : errorCostCenters ? (
            <div className="flex items-center gap-4">
              <p className="text-sm text-red-600">
                Error al cargar los centros de costo.
              </p>
              <button
                type="button"
                onClick={loadCostCenters}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Reintentar
              </button>
            </div>
          ) : costCenters.length === 0 ? (
            <p className="text-sm text-slate-500">
              No hay centros de costo activos.
            </p>
          ) : (
            <PlannedExpensesToolbar
              year={year}
              costCenters={costCenters}
              selectedCostCenterId={selectedCostCenterId}
              hasPendingChanges={hasPendingChanges}
              hasErrors={hasErrors}
              isSaving={isSaving}
              onYearChange={handleYearChange}
              onCostCenterChange={handleCostCenterChange}
              onSave={handleSave}
              onReload={handleReload}
            />
          )}
        </div>

        {saveMessage && (
          <div
            className={[
              "border-b px-6 py-3 text-sm font-medium",
              saveMessage.type === "ok"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800",
            ].join(" ")}
          >
            {saveMessage.text}
          </div>
        )}

        <div className="min-h-[200px]">
          {isLoadingData ? (
            <div className="space-y-3 px-6 py-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                  <div className="h-8 w-40 animate-pulse rounded bg-slate-100" />
                  {Array.from({ length: 12 }).map((__, m) => (
                    <div key={m} className="h-8 w-20 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              ))}
            </div>
          ) : errorData ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <p className="text-sm text-red-600">
                Error al cargar los datos. Verifica que el backend esté activo.
              </p>
              <button
                type="button"
                onClick={handleReload}
                className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Reintentar
              </button>
            </div>
          ) : selectedCostCenterId === null ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Selecciona un centro de costo para comenzar.
            </p>
          ) : (
            <PlannedExpensesMatrix
              concepts={concepts}
              records={records}
              isSaving={isSaving}
              pendingValues={pendingValues}
              onCellChange={handleCellChange}
            />
          )}
        </div>
      </section>
    </div>
  );
}
