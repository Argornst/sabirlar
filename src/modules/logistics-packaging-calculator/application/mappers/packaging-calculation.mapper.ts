import type {
  CreatePackagingCalculationRepositoryInput,
  PackagingCalculationResult,
  PackagingCalculatorFormValues,
  PackagingValidationStatus,
} from '../../domain';

export function mapFormAndResultToCreateCalculationRepositoryInput(
  values: PackagingCalculatorFormValues,
  result: PackagingCalculationResult,
): CreatePackagingCalculationRepositoryInput {
  const calculationValidationStatus: PackagingValidationStatus = result.validationStatus;

  return {
    calculation: {
      lotNumber: values.lotNumber.trim(),
      productId: values.productId,
      containerMaterialId: values.containerMaterialId,
      vacuumBagMaterialId: values.vacuumBagMaterialId,
      totalQuantityKg: values.totalQuantityKg === '' ? 0 : Number(values.totalQuantityKg),
      unitNetWeightKg: values.unitNetWeightKg === '' ? null : Number(values.unitNetWeightKg),
      totalContainerCount: result.totalContainerCount,
      totalPalletCount: result.totalPalletCount,
      totalGrossWeightKg: result.totalGrossWeightKg,
      totalNetWeightKg: result.totalNetWeightKg,
      totalTareWeightKg: result.totalTareWeightKg,
      validationStatus: calculationValidationStatus,
      notes: values.notes.trim() || null,
      createdBy: null,
    },
    palletLines: result.palletLineResults.map((line) => {
      const exceedsStackHeightLimit = result.stackSummaries.some(
        (stack) =>
          stack.exceedsStackHeightLimit &&
          stack.palletLineIds.includes(line.lineId),
      );

      return {
        palletMaterialId: line.palletMaterialId,
        palletCount: line.palletCount,
        unitsPerRow: line.unitsPerRow,
        totalUnits: line.totalUnits,
        rowCount: line.rowCount,
        palletHeightCm: line.palletHeightCm,
        palletGrossWeightKg: line.totalLineGrossWeightKg,
        palletNetWeightKg: line.totalLineNetWeightKg,
        palletTareWeightKg: line.totalLineTareWeightKg,
        stackGroup: line.stackGroup,
        stackOrder: line.stackOrder,
        exceedsSinglePalletHeightLimit: line.exceedsSinglePalletHeightLimit,
        exceedsStackHeightLimit,
      };
    }),
  };
}