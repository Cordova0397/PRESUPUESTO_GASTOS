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
