import type { PackagingProductMaterialRule, PackagingRulesRepository } from '../../domain';

export class GetPackagingRulesUseCase {
  constructor(private readonly repository: PackagingRulesRepository) {}

  execute(productId?: string): Promise<PackagingProductMaterialRule[]> {
    if (productId) {
      return this.repository.getByProductId(productId);
    }

    return this.repository.getAll();
  }
}