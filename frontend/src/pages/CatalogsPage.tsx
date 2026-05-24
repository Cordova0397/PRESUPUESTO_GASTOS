import { useEffect, useState } from "react";

import { CostCentersList } from "../components/catalogs/CostCentersList";
import { ExpenseConceptsList } from "../components/catalogs/ExpenseConceptsList";
import { PageHeader } from "../components/layout/PageHeader";
import { ErrorState } from "../components/ui/ErrorState";
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
        <ErrorState
          title="Error al cargar los catálogos"
          message={costCentersError}
          onRetry={() => setCcRetry((n) => n + 1)}
        />
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
