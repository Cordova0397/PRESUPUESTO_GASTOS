import { PeriodCostCenterFilters } from "../reports/PeriodCostCenterFilters";
import type { CostCenter } from "../../types/costCenter";
import type { ExpenseAnalysisFilters } from "../../types/report";

type Props = {
  costCenters: CostCenter[];
  onApply: (filters: ExpenseAnalysisFilters) => void;
  onReload: () => void;
};

export function AnalysisFilters({ costCenters, onApply, onReload }: Props) {
  return (
    <PeriodCostCenterFilters
      costCenters={costCenters}
      onApply={onApply}
      onReload={onReload}
    />
  );
}
