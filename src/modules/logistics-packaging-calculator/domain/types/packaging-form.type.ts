export interface PackagingCalculatorPalletLineFormValue {
  id: string;
  palletMaterialId: string;
  palletCount: number | '';
  unitsPerRow: number | '';
  unitsPerPallet: number | '';
  stackGroup: string;
  stackOrder: number | '';
}

export interface PackagingCalculatorFormValues {
  lotNumber: string;
  productId: string;
  totalQuantityKg: number | '';
  containerMaterialId: string;
  vacuumBagMaterialId: string | null;
  unitNetWeightKg: number | '';
  notes: string;
  palletLines: PackagingCalculatorPalletLineFormValue[];
}