import { supabase } from '../services/logistics-packaging-supabase.service';
import { mapPackagingRuleRow } from '../mappers/packaging-rule-row.mapper';

async function getActiveOrganizationId() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('Aktif kullanıcı bulunamadı.');
  }

  const { data, error } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('id', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data.organization_id;
}

export class SupabasePackagingRulesRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('packaging_product_material_rules')
      .select('*');

    if (error) throw error;

    return data.map(mapPackagingRuleRow);
  }

  async getByProductId(productId) {
    const { data, error } = await supabase
      .from('packaging_product_material_rules')
      .select('*')
      .eq('product_id', productId);

    if (error) throw error;

    return data.map(mapPackagingRuleRow);
  }

  async replaceProductRules(productId, rules) {
    const organizationId = await getActiveOrganizationId();

    const { error: deleteError } = await supabase
      .from('packaging_product_material_rules')
      .delete()
      .eq('product_id', productId);

    if (deleteError) throw deleteError;

    if (!rules.length) {
      return [];
    }

    const payload = rules.map((rule) => ({
      organization_id: organizationId,
      product_id: productId,
      material_id: rule.materialId,
      is_required: rule.isRequired,
    }));

    const { data, error } = await supabase
      .from('packaging_product_material_rules')
      .insert(payload)
      .select('*');

    if (error) throw error;

    return data.map(mapPackagingRuleRow);
  }
}