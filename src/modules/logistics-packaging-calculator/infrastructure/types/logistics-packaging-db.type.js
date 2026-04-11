export type DbPackagingMaterialType = 'PALLET' | 'BOX' | 'VACUUM_BAG' | 'DRUM';

export interface PackagingProductRow {
  id: string;
  organization_id: number;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackagingMaterialRow {
  id: string;
  organization_id: number;
  code: string;
  name: string;
  material_type: DbPackagingMaterialType;
  capacity_kg: number | null;
  tare_weight_kg: number;
  width_cm: number | null;
  length_cm: number | null;
  height_cm: number | null;
  is_stackable: boolean;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PackagingRuleRow {
  id: string;
  organization_id: number;
  product_id: string;
  material_id: string;
  is_required: boolean;
  created_at: string;
}

export interface PackagingCalculationRow {
  id: string;
  organization_id: number;
  lot_number: string;
  product_id: string;
  container_material_id: string;
  vacuum_bag_material_id: string | null;
  total_quantity_kg: number;
  unit_net_weight_kg: number | null;
  total_container_count: number;
  total_pallet_count: number;
  total_gross_weight_kg: number;
  total_net_weight_kg: number;
  total_tare_weight_kg: number;
  validation_status: 'VALID' | 'WARNING' | 'INVALID';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PackagingPalletLineRow {
  id: string;
  calculation_id: string;
  pallet_material_id: string;
  pallet_count: number;
  units_per_row: number;
  total_units: number;
  row_count: number;
  pallet_height_cm: number;
  pallet_gross_weight_kg: number;
  pallet_net_weight_kg: number;
  pallet_tare_weight_kg: number;
  stack_group: string | null;
  stack_order: number;
  exceeds_single_pallet_height_limit: boolean;
  exceeds_stack_height_limit: boolean;
  created_at: string;
}