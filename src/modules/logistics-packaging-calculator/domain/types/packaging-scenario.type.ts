import type { PackagingCalculationResult } from './packaging-calculation-result.type';
import type { PackagingCalculatorFormValues } from './packaging-form.type';
import type { PackagingValidationStatus } from '../entities/packaging-calculation.entity';
import type { PackagingStackSummary } from '../value-objects/stack-summary.vo';

export interface PackagingScenarioLotDraft {
  id: string;
  values: PackagingCalculatorFormValues;
}

export interface PackagingScenarioValues {
  name: string;
  lots: PackagingScenarioLotDraft[];
}

export interface PackagingScenarioLotResult {
  lotId: string;
  result: PackagingCalculationResult;
}

export interface PackagingScenarioAggregateResult {
  totalQuantityKg: number;
  totalNetWeightKg: number;
  totalGrossWeightKg: number;
  totalTareWeightKg: number;
  totalContainerCount: number;
  totalPalletCount: number;
  totalGroundPalletCount: number;
  stackSummaries: PackagingStackSummary[];
  validationStatus: PackagingValidationStatus;
  validationMessages: PackagingCalculationResult['validationMessages'];
}

export interface PackagingScenarioCalculationResult {
  lots: PackagingScenarioLotResult[];
  aggregate: PackagingScenarioAggregateResult;
}