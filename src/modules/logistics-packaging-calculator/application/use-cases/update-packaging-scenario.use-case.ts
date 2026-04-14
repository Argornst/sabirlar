import type {
  PackagingMaterial,
  PackagingProductMaterialRule,
  PackagingScenarioCalculationResult,
  PackagingScenariosRepository,
} from '../../domain';
import { CalculatePackagingUseCase } from './calculate-packaging.use-case';
import {
  buildScenarioAggregateResult,
  mapScenarioValuesAndResultsToUpdateRepositoryInput,
} from '../mappers/packaging-scenario.mapper';
import type { UpdatePackagingScenarioDto } from '../dto/update-packaging-scenario.dto';

interface UpdatePackagingScenarioUseCaseDependencies {
  scenariosRepository: PackagingScenariosRepository;
}

interface UpdatePackagingScenarioUseCaseContext {
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
}

export class UpdatePackagingScenarioUseCase {
  private readonly calculatePackagingUseCase = new CalculatePackagingUseCase();

  constructor(
    private readonly dependencies: UpdatePackagingScenarioUseCaseDependencies,
  ) {}

  async execute(
    dto: UpdatePackagingScenarioDto,
    context: UpdatePackagingScenarioUseCaseContext,
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

    const payload = mapScenarioValuesAndResultsToUpdateRepositoryInput(
      dto.scenarioId,
      dto.values,
      scenarioResult,
    );

    return this.dependencies.scenariosRepository.update(payload);
  }
}