export type PackagingValidationStatus = 'VALID' | 'WARNING' | 'INVALID';

export interface PackagingCalculation {
  id: string;
  lotNumber: string;
  productId: string;
  containerMaterialId: string;
  vacuumBagMaterialId: string | null;
  totalQuantityKg: number;
  unitNetWeightKg: number | null;
  totalContainerCount: number;
  totalPalletCount: number;
  totalGrossWeightKg: number;
  totalNetWeightKg: number;
  totalTareWeightKg: number;
  validationStatus: PackagingValidationStatus;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}