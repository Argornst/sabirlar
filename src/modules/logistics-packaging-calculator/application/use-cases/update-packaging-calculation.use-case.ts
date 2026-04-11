import type {
  PackagingCalculationsRepository,
  PackagingCalculationWithLines,
} from '../../domain';
import { CalculatePackagingUseCase } from './calculate-packaging.use-case';
import { mapFormAndResultToCreateCalculationRepositoryInput } from '../mappers/packaging-calculation.mapper';
import type { PackagingMaterial, PackagingProductMaterialRule } from '../../domain';
import type { UpdatePackagingCalculationDto } from '../dto/update-packaging-calculation.dto';

interface UpdatePackagingCalculationUseCaseDependencies {
  calculationsRepository: PackagingCalculationsRepository;
}

interface UpdatePackagingCalculationUseCaseContext {
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
}

export class UpdatePackagingCalculationUseCase {
  private readonly calculatePackagingUseCase = new CalculatePackagingUseCase();

  constructor(
    private readonly dependencies: UpdatePackagingCalculationUseCaseDependencies,
  ) {}

  async execute(
    dto: UpdatePackagingCalculationDto,
    context: UpdatePackagingCalculationUseCaseContext,
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

    const mapped = mapFormAndResultToCreateCalculationRepositoryInput(
      dto.values,
      result,
    );

    return this.dependencies.calculationsRepository.update({
      calculationId: dto.calculationId,
      calculation: mapped.calculation,
      palletLines: mapped.palletLines,
    });
  }
}