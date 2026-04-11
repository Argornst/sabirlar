export function mapPackagingMaterialRow(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    materialType: row.material_type,
    tareWeightKg: row.tare_weight_kg,
    widthCm: row.width_cm,
    lengthCm: row.length_cm,
    heightCm: row.height_cm,
    isStackable: row.is_stackable,
    isActive: row.is_active,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}