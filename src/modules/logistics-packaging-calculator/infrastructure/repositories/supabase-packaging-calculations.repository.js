import { supabase } from '../services/logistics-packaging-supabase.service.js';
import {
  mapPackagingCalculationRow,
  mapPackagingPalletLineRow,
} from '../mappers/packaging-calculation-row.mapper.js';

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

function mapCalculationInsertPayload(calculation, organizationId) {
  return {
    organization_id: organizationId,
    lot_number: calculation.lotNumber,
    product_id: calculation.productId,
    container_material_id: calculation.containerMaterialId,
    vacuum_bag_material_id: calculation.vacuumBagMaterialId,
    total_quantity_kg: calculation.totalQuantityKg,
    unit_net_weight_kg: calculation.unitNetWeightKg,
    total_container_count: calculation.totalContainerCount,
    total_pallet_count: calculation.totalPalletCount,
    total_gross_weight_kg: calculation.totalGrossWeightKg,
    total_net_weight_kg: calculation.totalNetWeightKg,
    total_tare_weight_kg: calculation.totalTareWeightKg,
    validation_status: calculation.validationStatus,
    notes: calculation.notes,
    created_by: calculation.createdBy,
  };
}

function mapCalculationUpdatePayload(calculation) {
  return {
    lot_number: calculation.lotNumber,
    product_id: calculation.productId,
    container_material_id: calculation.containerMaterialId,
    vacuum_bag_material_id: calculation.vacuumBagMaterialId,
    total_quantity_kg: calculation.totalQuantityKg,
    unit_net_weight_kg: calculation.unitNetWeightKg,
    total_container_count: calculation.totalContainerCount,
    total_pallet_count: calculation.totalPalletCount,
    total_gross_weight_kg: calculation.totalGrossWeightKg,
    total_net_weight_kg: calculation.totalNetWeightKg,
    total_tare_weight_kg: calculation.totalTareWeightKg,
    validation_status: calculation.validationStatus,
    notes: calculation.notes,
    created_by: calculation.createdBy,
  };
}

function mapPalletLineInsertPayload(line, calculationId) {
  return {
    calculation_id: calculationId,
    pallet_material_id: line.palletMaterialId,
    pallet_count: line.palletCount,
    units_per_row: line.unitsPerRow,
    total_units: line.totalUnits,
    row_count: line.rowCount,
    pallet_height_cm: line.palletHeightCm,
    pallet_gross_weight_kg: line.palletGrossWeightKg,
    pallet_net_weight_kg: line.palletNetWeightKg,
    pallet_tare_weight_kg: line.palletTareWeightKg,
    stack_group: line.stackGroup,
    stack_order: line.stackOrder,
    exceeds_single_pallet_height_limit: line.exceedsSinglePalletHeightLimit,
    exceeds_stack_height_limit: line.exceedsStackHeightLimit,
  };
}

export class SupabasePackagingCalculationsRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('packaging_calculations')
      .select(`
        *,
        packaging_calculation_pallet_lines (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      calculation: mapPackagingCalculationRow(row),
      palletLines: (row.packaging_calculation_pallet_lines ?? []).map(
        mapPackagingPalletLineRow,
      ),
    }));
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('packaging_calculations')
      .select(`
        *,
        packaging_calculation_pallet_lines (*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;

    return {
      calculation: mapPackagingCalculationRow(data),
      palletLines: (data.packaging_calculation_pallet_lines ?? []).map(
        mapPackagingPalletLineRow,
      ),
    };
  }

  async create(input) {
    const organizationId = await getActiveOrganizationId();

    const calculationPayload = mapCalculationInsertPayload(
      input.calculation,
      organizationId,
    );

    const { data, error } = await supabase
      .from('packaging_calculations')
      .insert(calculationPayload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const palletLinesPayload = (input.palletLines ?? []).map((line) =>
      mapPalletLineInsertPayload(line, data.id),
    );

    if (palletLinesPayload.length > 0) {
      const { error: palletLinesError } = await supabase
        .from('packaging_calculation_pallet_lines')
        .insert(palletLinesPayload);

      if (palletLinesError) {
        throw palletLinesError;
      }
    }

    return this.getById(data.id);
  }

  async update(input) {
    const calculationPayload = mapCalculationUpdatePayload(input.calculation);

    const { error: updateError } = await supabase
      .from('packaging_calculations')
      .update(calculationPayload)
      .eq('id', input.calculationId);

    if (updateError) {
      throw updateError;
    }

    const { error: deleteError } = await supabase
      .from('packaging_calculation_pallet_lines')
      .delete()
      .eq('calculation_id', input.calculationId);

    if (deleteError) {
      throw deleteError;
    }

    const palletLinesPayload = (input.palletLines ?? []).map((line) =>
      mapPalletLineInsertPayload(line, input.calculationId),
    );

    if (palletLinesPayload.length > 0) {
      const { error: insertError } = await supabase
        .from('packaging_calculation_pallet_lines')
        .insert(palletLinesPayload);

      if (insertError) {
        throw insertError;
      }
    }

    return this.getById(input.calculationId);
  }
}