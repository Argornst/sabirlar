import type {
  PackagingCalculationResult,
  PackagingCalculatorFormValues,
} from '../../domain';

function translateValidationStatus(status: string): string {
  if (status === 'VALID') return 'Uygun';
  if (status === 'WARNING') return 'Uyarılı';
  if (status === 'INVALID') return 'Hatalı';
  return status ?? '-';
}

export function createDefaultPackagingCalculatorFormValues(): PackagingCalculatorFormValues {
  return {
    lotNumber: '',
    productId: '',
    totalQuantityKg: '',
    containerMaterialId: '',
    vacuumBagMaterialId: null,
    unitNetWeightKg: '',
    notes: '',
    palletLines: [
      {
        id: crypto.randomUUID(),
        palletMaterialId: '',
        palletCount: 1,
        unitsPerRow: '',
        unitsPerPallet: '',
        stackGroup: '',
        stackOrder: 1,
      },
    ],
  };
}

export function mapCalculationResultToSummaryItems(
  result: PackagingCalculationResult,
): Array<{ label: string; value: string }> {
  return [
    { label: 'Toplam Net', value: `${result.totalNetWeightKg.toFixed(3)} kg` },
    { label: 'Toplam Dara', value: `${result.totalTareWeightKg.toFixed(3)} kg` },
    { label: 'Toplam Brüt', value: `${result.totalGrossWeightKg.toFixed(3)} kg` },
    { label: 'Toplam Ambalaj', value: `${result.totalContainerCount}` },
    { label: 'Toplam Palet', value: `${result.totalPalletCount}` },
    { label: 'Zemindeki Palet', value: `${result.totalGroundPalletCount}` },
    { label: 'Durum', value: translateValidationStatus(result.validationStatus) },
  ];
}