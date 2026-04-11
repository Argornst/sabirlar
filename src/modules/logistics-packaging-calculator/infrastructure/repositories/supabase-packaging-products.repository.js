import { supabase } from '../services/logistics-packaging-supabase.service';
import { mapPackagingProductRow } from '../mappers/packaging-product-row.mapper';

export class SupabasePackagingProductsRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('packaging_products')
      .select('*')
      .order('code');

    if (error) throw error;

    return data.map(mapPackagingProductRow);
  }
}