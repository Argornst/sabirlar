export interface PackagingStackSummary {
  stackGroup: string;
  totalHeightCm: number;
  totalGrossWeightKg: number;
  palletLineIds: string[];
  exceedsStackHeightLimit: boolean;
  groundPalletCount: number;
}