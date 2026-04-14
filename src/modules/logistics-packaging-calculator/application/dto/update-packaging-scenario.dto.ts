import type { PackagingScenarioValues } from '../../domain';

export interface UpdatePackagingScenarioDto {
  scenarioId: string;
  values: PackagingScenarioValues;
}