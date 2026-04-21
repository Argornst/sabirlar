import { SupabasePackagingCalculationsRepository } from '../infrastructure/repositories/supabase-packaging-calculations.repository.js';
import { SupabasePackagingMaterialsRepository } from '../infrastructure/repositories/supabase-packaging-materials.repository.js';
import { SupabasePackagingProductsRepository } from '../infrastructure/repositories/supabase-packaging-products.repository.js';
import { SupabasePackagingRulesRepository } from '../infrastructure/repositories/supabase-packaging-rules.repository.js';
import { SupabasePackagingScenariosRepository } from '../infrastructure/repositories/supabase-packaging-scenarios.repository.js';

const calculationsRepository = new SupabasePackagingCalculationsRepository();
const materialsRepository = new SupabasePackagingMaterialsRepository();
const productsRepository = new SupabasePackagingProductsRepository();
const rulesRepository = new SupabasePackagingRulesRepository();
const scenariosRepository = new SupabasePackagingScenariosRepository();

export const logisticsPackagingRuntime = {
  calculationsRepository,
  materialsRepository,
  productsRepository,
  rulesRepository,
  scenariosRepository,
};

export function createPackagingMaterial(payload) {
  return materialsRepository.create(payload);
}
