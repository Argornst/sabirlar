export interface PackagingCalculationPalletLine {
  id: string;
  calculationId: string;
  palletMaterialId: string;
  palletCount: number;
  unitsPerRow: number;
  totalUnits: number;
  rowCount: number;
  palletHeightCm: number;
  palletGrossWeightKg: number;
  palletNetWeightKg: number;
  palletTareWeightKg: number;
  stackGroup: string | null;
  stackOrder: number;
  exceedsSinglePalletHeightLimit: boolean;
  exceedsStackHeightLimit: boolean;
  createdAt: string;
}