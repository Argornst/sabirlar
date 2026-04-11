import type { PackagingProductMaterialRule } from '../entities/packaging-rule.entity';

export interface UpsertPackagingProductMaterialRuleInput {
  productId: string;
  materialId: string;
  isRequired: boolean;
}

export interface PackagingRulesRepository {
  getAll(): Promise<PackagingProductMaterialRule[]>;
  getByProductId(productId: string): Promise<PackagingProductMaterialRule[]>;
  replaceProductRules(
    productId: string,
    rules: UpsertPackagingProductMaterialRuleInput[],
  ): Promise<PackagingProductMaterialRule[]>;
}