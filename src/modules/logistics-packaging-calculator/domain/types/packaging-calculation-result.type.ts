import type { PackagingValidationStatus } from '../entities/packaging-calculation.entity';
import type { PackagingStackSummary } from '../value-objects/stack-summary.vo';

export type PackagingValidationMessageLevel = 'INFO' | 'WARNING' | 'ERROR';

export type PackagingValidationMessageCode =
  | 'INVALID_FORM'
  | 'INVALID_PRODUCT_RULE'
  | 'SINGLE_PALLET_HEIGHT_EXCEEDED'
  | 'STACK_HEIGHT_EXCEEDED'
  | 'QUANTITY_MISMATCH'
  | 'MISSING_CONTAINER_CAPACITY'
  | 'MISSING_MATERIAL_DIMENSION'
  | 'DUPLICATE_STACK_ORDER';

export interface PackagingValidationMessage {
  level: PackagingValidationMessageLevel;
  code: PackagingValidationMessageCode;
  message: string;
  palletLineId?: string;
  stackGroup?: string;
}

export interface PackagingPalletLineCalculationResult {
  lineId: string;
  palletMaterialId: string;
  palletName: string;
  palletCount: number;
  unitsPerRow: number;
  unitsPerPallet: number;
  totalUnits: number;
  rowCount: number;
  palletHeightCm: number;
  palletGrossWeightKg: number;
  palletNetWeightKg: number;
  palletTareWeightKg: number;
  totalLineGrossWeightKg: number;
  totalLineNetWeightKg: number;
  totalLineTareWeightKg: number;
  stackGroup: string | null;
  stackOrder: number;
  exceedsSinglePalletHeightLimit: boolean;
}

export interface PackagingCalculationResult {
  totalQuantityKg: number;
  totalNetWeightKg: number;
  totalGrossWeightKg: number;
  totalTareWeightKg: number;
  totalContainerCount: number;
  totalPalletCount: number;
  totalGroundPalletCount: number;
  palletLineResults: PackagingPalletLineCalculationResult[];
  stackSummaries: PackagingStackSummary[];
  validationStatus: PackagingValidationStatus;
  validationMessages: PackagingValidationMessage[];
}