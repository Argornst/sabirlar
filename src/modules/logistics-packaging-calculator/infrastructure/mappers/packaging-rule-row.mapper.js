export function mapPackagingRuleRow(row) {
  return {
    id: row.id,
    productId: row.product_id,
    materialId: row.material_id,
    isRequired: row.is_required,
    createdAt: row.created_at,
  };
}