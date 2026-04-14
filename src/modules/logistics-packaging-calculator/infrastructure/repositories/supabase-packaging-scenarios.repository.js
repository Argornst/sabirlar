import { supabase } from '../services/logistics-packaging-supabase.service.js';

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

function mapScenarioRow(row) {
  return {
    id: row.id,
    name: row.name,
    organizationId: row.organization_id,
    createdBy: row.created_by,
    updatedBy: row.updated_by ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at ?? null,
  };
}

function mapScenarioLotRow(row) {
  return {
    id: row.id,
    scenarioId: row.scenario_id,
    organizationId: row.organization_id,
    lotNumber: row.lot_no,
    productId: row.product_id,
    totalQuantityKg: row.total_quantity,
    unitNetWeightKg: row.unit_net_weight,
    containerMaterialId: row.container_material_id,
    vacuumBagMaterialId: row.vacuum_material_id,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at ?? null,
  };
}

function mapScenarioPalletLineRow(row) {
  return {
    id: row.id,
    lotId: row.lot_id,
    organizationId: row.organization_id,
    palletMaterialId: row.pallet_material_id,
    palletCount: row.pallet_count,
    unitsPerRow: row.units_per_row,
    unitsPerPallet: row.units_per_pallet,
    stackGroup: row.stack_group,
    stackOrder: row.stack_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at ?? null,
  };
}

async function getById(id) {
  const { data, error } = await supabase
    .from('packaging_scenarios')
    .select(`
      *,
      packaging_scenario_lots (
        *,
        packaging_scenario_pallet_lines (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return {
    scenario: mapScenarioRow(data),
    lots: (data.packaging_scenario_lots ?? []).map((lot) => ({
      lot: mapScenarioLotRow(lot),
      palletLines: (lot.packaging_scenario_pallet_lines ?? []).map(
        mapScenarioPalletLineRow,
      ),
    })),
  };
}

export class SupabasePackagingScenariosRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('packaging_scenarios')
      .select(`
        *,
        packaging_scenario_lots (
          *,
          packaging_scenario_pallet_lines (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((scenario) => ({
      scenario: mapScenarioRow(scenario),
      lots: (scenario.packaging_scenario_lots ?? []).map((lot) => ({
        lot: mapScenarioLotRow(lot),
        palletLines: (lot.packaging_scenario_pallet_lines ?? []).map(
          mapScenarioPalletLineRow,
        ),
      })),
    }));
  }

  async create(input) {
    const organizationId = await getActiveOrganizationId();

    const { data: scenarioRow, error: scenarioError } = await supabase
      .from('packaging_scenarios')
      .insert({
        organization_id: organizationId,
        name: input.scenario.name,
        created_by: input.scenario.createdBy ?? null,
        updated_by: input.scenario.updatedBy ?? null,
      })
      .select('*')
      .single();

    if (scenarioError) {
      throw scenarioError;
    }

    const scenarioId = scenarioRow.id;
    const createdLots = [];

    for (const lot of input.lots) {
      const { data: lotRow, error: lotError } = await supabase
        .from('packaging_scenario_lots')
        .insert({
          scenario_id: scenarioId,
          organization_id: organizationId,
          lot_no: lot.lotNumber,
          product_id: lot.productId,
          total_quantity: lot.totalQuantityKg,
          unit_net_weight: lot.unitNetWeightKg,
          container_material_id: lot.containerMaterialId,
          vacuum_material_id: lot.vacuumBagMaterialId,
          notes: lot.notes,
        })
        .select('*')
        .single();

      if (lotError) {
        throw lotError;
      }

      const palletLinesPayload = lot.palletLines.map((line) => ({
        lot_id: lotRow.id,
        organization_id: organizationId,
        pallet_material_id: line.palletMaterialId,
        pallet_count: line.palletCount,
        units_per_row: line.unitsPerRow,
        units_per_pallet: line.unitsPerPallet,
        stack_group: line.stackGroup,
        stack_order: line.stackOrder,
      }));

      let palletLineRows = [];

      if (palletLinesPayload.length > 0) {
        const { data, error: palletLinesError } = await supabase
          .from('packaging_scenario_pallet_lines')
          .insert(palletLinesPayload)
          .select('*');

        if (palletLinesError) {
          throw palletLinesError;
        }

        palletLineRows = data ?? [];
      }

      createdLots.push({
        lot: mapScenarioLotRow(lotRow),
        palletLines: palletLineRows.map(mapScenarioPalletLineRow),
      });
    }

    return {
      scenario: mapScenarioRow(scenarioRow),
      lots: createdLots,
    };
  }

  async update(input) {
    const organizationId = await getActiveOrganizationId();

    const { error: scenarioUpdateError } = await supabase
      .from('packaging_scenarios')
      .update({
        name: input.scenario.name,
        updated_by: input.scenario.updatedBy ?? null,
      })
      .eq('id', input.scenarioId)
      .eq('organization_id', organizationId);

    if (scenarioUpdateError) {
      throw scenarioUpdateError;
    }

    const { data: existingLots, error: existingLotsError } = await supabase
      .from('packaging_scenario_lots')
      .select('id')
      .eq('scenario_id', input.scenarioId)
      .eq('organization_id', organizationId);

    if (existingLotsError) {
      throw existingLotsError;
    }

    const existingLotIds = (existingLots ?? []).map((lot) => lot.id);

    if (existingLotIds.length > 0) {
      const { error: deletePalletLinesError } = await supabase
        .from('packaging_scenario_pallet_lines')
        .delete()
        .in('lot_id', existingLotIds)
        .eq('organization_id', organizationId);

      if (deletePalletLinesError) {
        throw deletePalletLinesError;
      }

      const { error: deleteLotsError } = await supabase
        .from('packaging_scenario_lots')
        .delete()
        .eq('scenario_id', input.scenarioId)
        .eq('organization_id', organizationId);

      if (deleteLotsError) {
        throw deleteLotsError;
      }
    }

    for (const lot of input.lots) {
      const { data: lotRow, error: lotError } = await supabase
        .from('packaging_scenario_lots')
        .insert({
          scenario_id: input.scenarioId,
          organization_id: organizationId,
          lot_no: lot.lotNumber,
          product_id: lot.productId,
          total_quantity: lot.totalQuantityKg,
          unit_net_weight: lot.unitNetWeightKg,
          container_material_id: lot.containerMaterialId,
          vacuum_material_id: lot.vacuumBagMaterialId,
          notes: lot.notes,
        })
        .select('*')
        .single();

      if (lotError) {
        throw lotError;
      }

      const palletLinesPayload = lot.palletLines.map((line) => ({
        lot_id: lotRow.id,
        organization_id: organizationId,
        pallet_material_id: line.palletMaterialId,
        pallet_count: line.palletCount,
        units_per_row: line.unitsPerRow,
        units_per_pallet: line.unitsPerPallet,
        stack_group: line.stackGroup,
        stack_order: line.stackOrder,
      }));

      if (palletLinesPayload.length > 0) {
        const { error: palletLinesError } = await supabase
          .from('packaging_scenario_pallet_lines')
          .insert(palletLinesPayload);

        if (palletLinesError) {
          throw palletLinesError;
        }
      }
    }

    return getById(input.scenarioId);
  }

  async delete(id) {
    const { error } = await supabase
      .from('packaging_scenarios')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}