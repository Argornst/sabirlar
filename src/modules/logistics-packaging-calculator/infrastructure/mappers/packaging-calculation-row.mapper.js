export function mapPackagingCalculationRow(row) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    lotNumber: row.lot_number,
    productId: row.product_id,
    containerMaterialId: row.container_material_id,
    vacuumBagMaterialId: row.vacuum_bag_material_id,
    totalQuantityKg: row.total_quantity_kg,
    unitNetWeightKg: row.unit_net_weight_kg,
    totalContainerCount: row.total_container_count,
    totalPalletCount: row.total_pallet_count,
    totalGrossWeightKg: row.total_gross_weight_kg,
    totalNetWeightKg: row.total_net_weight_kg,
    totalTareWeightKg: row.total_tare_weight_kg,
    validationStatus: row.validation_status,
    validationMessages: Array.isArray(row.validation_messages)
      ? row.validation_messages
      : [],
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPackagingPalletLineRow(row) {
  return {
    id: row.id,
    calculationId: row.calculation_id,
    palletMaterialId: row.pallet_material_id,
    palletCount: row.pallet_count,
    unitsPerRow: row.units_per_row,
    totalUnits: row.total_units,
    rowCount: row.row_count,
    palletHeightCm: row.pallet_height_cm,
    palletGrossWeightKg: row.pallet_gross_weight_kg,
    palletNetWeightKg: row.pallet_net_weight_kg,
    palletTareWeightKg: row.pallet_tare_weight_kg,
    stackGroup: row.stack_group,
    stackOrder: row.stack_order,
    exceedsSinglePalletHeightLimit: row.exceeds_single_pallet_height_limit,
    exceedsStackHeightLimit: row.exceeds_stack_height_limit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}