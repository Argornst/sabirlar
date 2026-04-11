import { supabase } from '../services/logistics-packaging-supabase.service.js';
import { mapPackagingMaterialRow } from '../mappers/packaging-material-row.mapper.js';

async function getActiveOrganizationId() {
  const { data, error } = await supabase.rpc('current_user_organization_id');

  if (error) {
    throw error;
  }

  if (data == null) {
    throw new Error('Aktif organizasyon bulunamadı.');
  }

  return data;
}

export class SupabasePackagingMaterialsRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('packaging_materials')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map(mapPackagingMaterialRow);
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('packaging_materials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;

    return mapPackagingMaterialRow(data);
  }

  async create(input) {
    const organizationId = await getActiveOrganizationId();

    const payload = {
      organization_id: organizationId,
      code: input.code,
      name: input.name,
      material_type: input.materialType,
      tare_weight_kg: input.tareWeightKg,
      width_cm: input.widthCm,
      length_cm: input.lengthCm,
      height_cm: input.heightCm,
      is_stackable: input.isStackable ?? false,
      is_active: input.isActive ?? true,
      metadata: input.metadata ?? {},
    };

    const { error } = await supabase
      .from('packaging_materials')
      .insert(payload);

    if (error) throw error;

    return {
      id: '',
      code: payload.code,
      name: payload.name,
      materialType: payload.material_type,
      tareWeightKg: payload.tare_weight_kg,
      widthCm: payload.width_cm,
      lengthCm: payload.length_cm,
      heightCm: payload.height_cm,
      isStackable: payload.is_stackable,
      isActive: payload.is_active,
      metadata: payload.metadata,
      createdAt: '',
      updatedAt: '',
    };
  }

  async update(id, input) {
    const payload = {};

    if (input.code !== undefined) payload.code = input.code;
    if (input.name !== undefined) payload.name = input.name;
    if (input.materialType !== undefined) payload.material_type = input.materialType;
    if (input.tareWeightKg !== undefined) payload.tare_weight_kg = input.tareWeightKg;
    if (input.widthCm !== undefined) payload.width_cm = input.widthCm;
    if (input.lengthCm !== undefined) payload.length_cm = input.lengthCm;
    if (input.heightCm !== undefined) payload.height_cm = input.heightCm;
    if (input.isStackable !== undefined) payload.is_stackable = input.isStackable;
    if (input.isActive !== undefined) payload.is_active = input.isActive;
    if (input.metadata !== undefined) payload.metadata = input.metadata;

    const { data, error } = await supabase
      .from('packaging_materials')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return mapPackagingMaterialRow(data);
  }
}