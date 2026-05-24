import { useEffect, useState } from "react";

import { CostCentersList } from "../components/catalogs/CostCentersList";
import { ExpenseConceptsList } from "../components/catalogs/ExpenseConceptsList";
import { PageHeader } from "../components/layout/PageHeader";
import {
  getActiveCostCenters,
  getActiveExpenseConceptsByCostCenter,
} from "../services/catalogsService";
import type { CostCenter } from "../types/costCenter";
import type { ExpenseConcept } from "../types/expenseConcept";

export function CatalogsPage() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [costCentersLoading, setCostCentersLoading] = useState(true);
  const [costCentersError, setCostCentersError] = useState<string | null>(null);
  const [ccRetry, setCcRetry] = useState(0);

  const [selectedCostCenterId, setSelectedCostCenterId] = useState<number | null>(null);
  const [expenseConcepts, setExpenseConcepts] = useState<ExpenseConcept[]>([]);
  const [conceptsLoading, setConceptsLoading] = useState(false);
  const [conceptsError, setConceptsError] = useState<string | null>(null);
  const [conceptsRetry, setConceptsRetry] = useState(0);

  // Carga centros de costo
  useEffect(() => {
    let cancelled = false;
    setCostCentersLoading(true);
    setCostCentersError(null);

    getActiveCostCenters()
      .then((data) => {
        if (cancelled) return;
        setCostCenters(data);
        if (data.length > 0) {
          // Auto-selecciona el primero solo si aún no hay selección
          setSelectedCostCenterId((prev) => prev ?? data[0].id);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Error al cargar los centros de costo.";
        setCostCentersError(msg);
      })
      .finally(() => {
        if (cancelled) return;
        setCostCentersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ccRetry]);

  // Carga conceptos cuando cambia el centro o se reintenta
  useEffect(() => {
    if (selectedCostCenterId === null) return;

    let cancelled = false;
    setConceptsLoading(true);
    setConceptsError(null);
    setExpenseConcepts([]);

    getActiveExpenseConceptsByCostCenter(selectedCostCenterId)
      .then((data) => {
        if (cancelled) return;
        setExpenseConcepts(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "Error al cargar los conceptos de gasto.";
        setConceptsError(msg);
      })
      .finally(() => {
        if (cancelled) return;
        setConceptsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCostCenterId, conceptsRetry]);

  const selectedCostCenter =
    costCenters.find((cc) => cc.id === selectedCostCenterId) ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogos básicos"
        description="Centros de costo y conceptos de gasto disponibles para el MVP."
        badge="Solo lectura"
      />

      {costCentersError ? (
        <section className="rounded-[28px] border border-red-200 bg-red-50 p-6 shadow-panel">
          <p className="text-sm font-semibold text-red-700">
            Error al cargar los catálogos
          </p>
          <p className="mt-2 text-sm text-red-600">{costCentersError}</p>
          <button
            onClick={() => setCcRetry((n) => n + 1)}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-red-700"
          >
            Reintentar
          </button>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <CostCentersList
            costCenters={costCenters}
            selectedCostCenterId={selectedCostCenterId}
            onSelect={setSelectedCostCenterId}
            isLoading={costCentersLoading}
          />
          <ExpenseConceptsList
            expenseConcepts={expenseConcepts}
            isLoading={conceptsLoading}
            error={conceptsError}
            onRetry={() => setConceptsRetry((n) => n + 1)}
            selectedCostCenter={selectedCostCenter}
          />
        </div>
      )}
    </div>
  );
}
