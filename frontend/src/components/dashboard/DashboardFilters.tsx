import { PeriodCostCenterFilters } from "../reports/PeriodCostCenterFilters";
import type { CostCenter } from "../../types/costCenter";
import type { ExpenseKpisFilters } from "../../types/report";

type Props = {
  costCenters: CostCenter[];
  onApply: (filters: ExpenseKpisFilters) => void;
  onReload: () => void;
};

export function DashboardFilters({ costCenters, onApply, onReload }: Props) {
  return (
    <PeriodCostCenterFilters
      costCenters={costCenters}
      onApply={onApply}
      onReload={onReload}
    />
  );
}
