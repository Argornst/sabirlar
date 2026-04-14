import type {
  PackagingMaterial,
  PackagingProductMaterialRule,
  PackagingScenarioCalculationResult,
  PackagingScenariosRepository,
} from '../../domain';
import { CalculatePackagingUseCase } from './calculate-packaging.use-case';
import { buildScenarioAggregateResult, mapScenarioValuesAndResultsToRepositoryInput } from '../mappers/packaging-scenario.mapper';
import type { CreatePackagingScenarioDto } from '../dto/create-packaging-scenario.dto';

interface CreatePackagingScenarioUseCaseDependencies {
  scenariosRepository: PackagingScenariosRepository;
}

interface CreatePackagingScenarioUseCaseContext {
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
}

export class CreatePackagingScenarioUseCase {
  private readonly calculatePackagingUseCase = new CalculatePackagingUseCase();

  constructor(
    private readonly dependencies: CreatePackagingScenarioUseCaseDependencies,
  ) {}

  async execute(
    dto: CreatePackagingScenarioDto,
    context: CreatePackagingScenarioUseCaseContext,
  ) {
    const lotResults = dto.values.lots.map((lot) => ({
      lotId: lot.id,
      result: this.calculatePackagingUseCase.execute({
        values: lot.values,
        materials: context.materials,
        productRules: context.productRules.filter(
          (rule) => rule.productId === lot.values.productId,
        ),
      }),
    }));

    const hasBlockingError = lotResults.some((item) =>
      item.result.validationMessages.some((message) => message.level === 'ERROR'),
    );

    if (hasBlockingError) {
      throw new Error('Senaryoda doğrulama hatası olan lotlar var.');
    }

    const scenarioResult: PackagingScenarioCalculationResult = {
      lots: lotResults,
      aggregate: buildScenarioAggregateResult(lotResults),
    };

    const payload = mapScenarioValuesAndResultsToRepositoryInput(
      dto.values,
      scenarioResult,
    );

    return this.dependencies.scenariosRepository.create(payload);
  }
}