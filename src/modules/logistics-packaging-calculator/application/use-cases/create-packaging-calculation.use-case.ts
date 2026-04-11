import type {
  PackagingCalculationsRepository,
  PackagingCalculationWithLines,
} from '../../domain';
import { CalculatePackagingUseCase } from './calculate-packaging.use-case';
import { mapFormAndResultToCreateCalculationRepositoryInput } from '../mappers/packaging-calculation.mapper';
import type { PackagingMaterial, PackagingProductMaterialRule } from '../../domain';
import type { CreatePackagingCalculationDto } from '../dto/create-packaging-calculation.dto';

interface CreatePackagingCalculationUseCaseDependencies {
  calculationsRepository: PackagingCalculationsRepository;
}

interface CreatePackagingCalculationUseCaseContext {
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
}

export class CreatePackagingCalculationUseCase {
  private readonly calculatePackagingUseCase = new CalculatePackagingUseCase();

  constructor(
    private readonly dependencies: CreatePackagingCalculationUseCaseDependencies,
  ) {}

  async execute(
    dto: CreatePackagingCalculationDto,
    context: CreatePackagingCalculationUseCaseContext,
  ): Promise<PackagingCalculationWithLines> {
    const result = this.calculatePackagingUseCase.execute({
      values: dto.values,
      materials: context.materials,
      productRules: context.productRules,
    });

    const hasBlockingError = result.validationMessages.some(
      (message) => message.level === 'ERROR',
    );

    if (hasBlockingError) {
      throw new Error('Paketleme hesaplamasında doğrulama hataları var.');
    }

    const payload = mapFormAndResultToCreateCalculationRepositoryInput(
      dto.values,
      result,
    );

    return this.dependencies.calculationsRepository.create(payload);
  }
}