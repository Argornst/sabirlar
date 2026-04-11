export interface PackagingContainerSummary {
  containerMaterialId: string;
  vacuumBagMaterialId: string | null;
  unitNetWeightKg: number | null;
  totalContainerCount: number;
}