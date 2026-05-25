export type CostCenter = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CostCenterCreatePayload = {
  name: string;
  description?: string | null;
  color?: string | null;
  sort_order?: number | null;
  is_active?: boolean;
};

export type CostCenterUpdatePayload = {
  name: string;
  description?: string | null;
  color?: string | null;
  sort_order?: number | null;
  is_active?: boolean;
};
