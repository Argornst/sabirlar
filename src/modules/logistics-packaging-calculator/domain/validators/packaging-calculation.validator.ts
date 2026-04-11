import type { PackagingCalculatorFormValues } from '../types/packaging-form.type';
import type { PackagingValidationMessage } from '../types/packaging-calculation-result.type';

export function validatePackagingCalculationForm(
  values: PackagingCalculatorFormValues,
): PackagingValidationMessage[] {
  const messages: PackagingValidationMessage[] = [];

  if (!values.lotNumber.trim()) {
    messages.push({
      level: 'ERROR',
      code: 'INVALID_FORM',
      message: 'Lot numarası zorunludur.',
    });
  }

  if (!values.productId) {
    messages.push({
      level: 'ERROR',
      code: 'INVALID_FORM',
      message: 'Ürün seçimi zorunludur.',
    });
  }

  if (!values.containerMaterialId) {
    messages.push({
      level: 'ERROR',
      code: 'INVALID_FORM',
      message: 'Taşıyıcı ambalaj seçimi zorunludur.',
    });
  }

  if (values.totalQuantityKg === '' || Number(values.totalQuantityKg) <= 0) {
    messages.push({
      level: 'ERROR',
      code: 'INVALID_FORM',
      message: 'Toplam miktar sıfırdan büyük olmalıdır.',
    });
  }

  if (values.unitNetWeightKg === '' || Number(values.unitNetWeightKg) <= 0) {
    messages.push({
      level: 'ERROR',
      code: 'INVALID_FORM',
      message: 'Birim net ağırlık sıfırdan büyük olmalıdır.',
    });
  }

  if (values.palletLines.length === 0) {
    messages.push({
      level: 'ERROR',
      code: 'INVALID_FORM',
      message: 'En az bir palet satırı eklemelisiniz.',
    });
  }

  values.palletLines.forEach((line) => {
    if (!line.palletMaterialId) {
      messages.push({
        level: 'ERROR',
        code: 'INVALID_FORM',
        message: 'Palet tipi seçilmelidir.',
        palletLineId: line.id,
      });
    }

    if (line.palletCount === '' || Number(line.palletCount) <= 0) {
      messages.push({
        level: 'ERROR',
        code: 'INVALID_FORM',
        message: 'Palet adedi sıfırdan büyük olmalıdır.',
        palletLineId: line.id,
      });
    }

    if (line.unitsPerRow === '' || Number(line.unitsPerRow) <= 0) {
      messages.push({
        level: 'ERROR',
        code: 'INVALID_FORM',
        message: 'Bir sıradaki adet sıfırdan büyük olmalıdır.',
        palletLineId: line.id,
      });
    }

    if (line.unitsPerPallet === '' || Number(line.unitsPerPallet) <= 0) {
      messages.push({
        level: 'ERROR',
        code: 'INVALID_FORM',
        message: 'Paletteki toplam ambalaj sıfırdan büyük olmalıdır.',
        palletLineId: line.id,
      });
    }

    if (
      line.unitsPerPallet !== '' &&
      line.unitsPerRow !== '' &&
      Number(line.unitsPerRow) > Number(line.unitsPerPallet)
    ) {
      messages.push({
        level: 'ERROR',
        code: 'INVALID_FORM',
        message: 'Bir sıradaki adet, paletteki toplam adetten büyük olamaz.',
        palletLineId: line.id,
      });
    }
  });

  return messages;
}