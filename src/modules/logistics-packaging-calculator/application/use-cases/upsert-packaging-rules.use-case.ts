import type { PackagingRulesRepository } from '../../domain';
import type { UpsertPackagingRulesDto } from '../dto/upsert-packaging-rules.dto';

export class UpsertPackagingRulesUseCase {
  constructor(private readonly repository: PackagingRulesRepository) {}

  async execute(dto: UpsertPackagingRulesDto) {
    if (!dto.productId) {
      throw new Error('Ürün seçimi zorunludur.');
    }

    return this.repository.replaceProductRules(
      dto.productId,
      dto.rules.map((rule) => ({
        productId: dto.productId,
        materialId: rule.materialId,
        isRequired: rule.isRequired,
      })),
    );
  }
}