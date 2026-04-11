import { PACKAGING_CONSTRAINTS } from '../enums/packaging-constraint.enum';
import type { PackagingMaterial } from '../entities/packaging-material.entity';
import type { PackagingProductMaterialRule } from '../entities/packaging-rule.entity';
import type {
  PackagingCalculationResult,
  PackagingPalletLineCalculationResult,
  PackagingValidationMessage,
} from '../types/packaging-calculation-result.type';
import type { PackagingCalculatorFormValues } from '../types/packaging-form.type';
import type { PackagingStackSummary } from '../value-objects/stack-summary.vo';
import { validatePackagingCalculationForm } from '../validators/packaging-calculation.validator';

interface PackagingCalculatorDependencies {
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
}

function round(value: number, precision = 3): number {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

export class PackagingCalculatorService {
  calculate(
    formValues: PackagingCalculatorFormValues,
    dependencies: PackagingCalculatorDependencies,
  ): PackagingCalculationResult {
    const validationMessages: PackagingValidationMessage[] = [
      ...validatePackagingCalculationForm(formValues),
    ];

    const { materials, productRules } = dependencies;

    const totalQuantityKg =
      formValues.totalQuantityKg === '' ? 0 : Number(formValues.totalQuantityKg);

    const unitNetWeightKg =
      formValues.unitNetWeightKg === '' ? 0 : Number(formValues.unitNetWeightKg);

    const containerMaterial =
      materials.find((material) => material.id === formValues.containerMaterialId) ?? null;

    const vacuumBagMaterial = formValues.vacuumBagMaterialId
      ? materials.find((material) => material.id === formValues.vacuumBagMaterialId) ?? null
      : null;

    if (!containerMaterial) {
      validationMessages.push({
        level: 'ERROR',
        code: 'INVALID_FORM',
        message: 'Seçilen taşıyıcı ambalaj bulunamadı.',
      });
    }

    if (formValues.vacuumBagMaterialId && !vacuumBagMaterial) {
      validationMessages.push({
        level: 'ERROR',
        code: 'INVALID_FORM',
        message: 'Seçilen vakum torbası bulunamadı.',
      });
    }

    const allowedMaterialIds = new Set(
      productRules
        .filter((rule) => rule.productId === formValues.productId)
        .map((rule) => rule.materialId),
    );

    if (
      formValues.productId &&
      formValues.containerMaterialId &&
      allowedMaterialIds.size > 0 &&
      !allowedMaterialIds.has(formValues.containerMaterialId)
    ) {
      validationMessages.push({
        level: 'ERROR',
        code: 'INVALID_PRODUCT_RULE',
        message: 'Seçilen ürün için bu taşıyıcı ambalaj kullanımda değil.',
      });
    }

    formValues.palletLines.forEach((line) => {
      if (
        formValues.productId &&
        line.palletMaterialId &&
        allowedMaterialIds.size > 0 &&
        !allowedMaterialIds.has(line.palletMaterialId)
      ) {
        validationMessages.push({
          level: 'ERROR',
          code: 'INVALID_PRODUCT_RULE',
          message: 'Seçilen ürün için bu palet tipi kullanımda değil.',
          palletLineId: line.id,
        });
      }
    });

    const palletLineResults: PackagingPalletLineCalculationResult[] = formValues.palletLines
      .filter(
        (line) =>
          line.palletMaterialId &&
          line.palletCount !== '' &&
          line.unitsPerRow !== '' &&
          line.unitsPerPallet !== '' &&
          Number(line.palletCount) > 0 &&
          Number(line.unitsPerRow) > 0 &&
          Number(line.unitsPerPallet) > 0,
      )
      .map((line) => {
        const palletMaterial = materials.find((material) => material.id === line.palletMaterialId);

        if (!palletMaterial) {
          validationMessages.push({
            level: 'ERROR',
            code: 'INVALID_FORM',
            message: 'Seçilen palet tipi bulunamadı.',
            palletLineId: line.id,
          });

          return {
            lineId: line.id,
            palletMaterialId: line.palletMaterialId,
            palletName: 'Bilinmeyen Palet',
            palletCount: Number(line.palletCount),
            unitsPerRow: Number(line.unitsPerRow),
            unitsPerPallet: Number(line.unitsPerPallet),
            totalUnits: 0,
            rowCount: 0,
            palletHeightCm: 0,
            palletGrossWeightKg: 0,
            palletNetWeightKg: 0,
            palletTareWeightKg: 0,
            totalLineGrossWeightKg: 0,
            totalLineNetWeightKg: 0,
            totalLineTareWeightKg: 0,
            stackGroup: line.stackGroup || null,
            stackOrder: line.stackOrder === '' ? 1 : Number(line.stackOrder),
            exceedsSinglePalletHeightLimit: false,
          };
        }

        const palletCount = Number(line.palletCount);
        const unitsPerRow = Number(line.unitsPerRow);
        const unitsPerPallet = Number(line.unitsPerPallet);
        const totalUnits = palletCount * unitsPerPallet;

        const rowCount = Math.ceil(unitsPerPallet / unitsPerRow);

        if (!containerMaterial?.heightCm || !palletMaterial.heightCm) {
          validationMessages.push({
            level: 'WARNING',
            code: 'MISSING_MATERIAL_DIMENSION',
            message: 'Yükseklik hesaplaması için bazı malzeme ölçüleri eksik.',
            palletLineId: line.id,
          });
        }

        const palletHeightCm = round(
          (palletMaterial.heightCm ?? 0) + rowCount * (containerMaterial?.heightCm ?? 0),
          2,
        );

        const palletNetWeightKg = round(unitsPerPallet * unitNetWeightKg);
        const palletTareWeightKg = round(
          (palletMaterial.tareWeightKg ?? 0) +
            unitsPerPallet * (containerMaterial?.tareWeightKg ?? 0) +
            unitsPerPallet * (vacuumBagMaterial?.tareWeightKg ?? 0),
        );

        const palletGrossWeightKg = round(palletNetWeightKg + palletTareWeightKg);

        const totalLineNetWeightKg = round(palletCount * palletNetWeightKg);
        const totalLineTareWeightKg = round(palletCount * palletTareWeightKg);
        const totalLineGrossWeightKg = round(palletCount * palletGrossWeightKg);

        const exceedsSinglePalletHeightLimit =
          palletHeightCm > PACKAGING_CONSTRAINTS.MAX_SINGLE_PALLET_HEIGHT_CM;

        if (exceedsSinglePalletHeightLimit) {
          validationMessages.push({
            level: 'WARNING',
            code: 'SINGLE_PALLET_HEIGHT_EXCEEDED',
            message: `Palet yüksekliği ${PACKAGING_CONSTRAINTS.MAX_SINGLE_PALLET_HEIGHT_CM} cm limitini aşıyor.`,
            palletLineId: line.id,
          });
        }

        return {
          lineId: line.id,
          palletMaterialId: palletMaterial.id,
          palletName: palletMaterial.name,
          palletCount,
          unitsPerRow,
          unitsPerPallet,
          totalUnits,
          rowCount,
          palletHeightCm,
          palletGrossWeightKg,
          palletNetWeightKg,
          palletTareWeightKg,
          totalLineGrossWeightKg,
          totalLineNetWeightKg,
          totalLineTareWeightKg,
          stackGroup: line.stackGroup?.trim() ? line.stackGroup.trim() : null,
          stackOrder: line.stackOrder === '' ? 1 : Number(line.stackOrder),
          exceedsSinglePalletHeightLimit,
        };
      });

    const stackLinesMap = new Map<string, PackagingPalletLineCalculationResult[]>();

    palletLineResults.forEach((line) => {
      if (!line.stackGroup) return;

      const current = stackLinesMap.get(line.stackGroup) ?? [];
      current.push(line);
      stackLinesMap.set(line.stackGroup, current);
    });

    const stackSummaries: PackagingStackSummary[] = Array.from(stackLinesMap.entries()).map(
      ([stackGroup, lines]) => {
        const orderGroups = new Map<number, PackagingPalletLineCalculationResult[]>();

        lines.forEach((line) => {
          const group = orderGroups.get(line.stackOrder) ?? [];
          group.push(line);
          orderGroups.set(line.stackOrder, group);
        });

        orderGroups.forEach((groupLines, stackOrder) => {
          if (groupLines.length > 1) {
            validationMessages.push({
              level: 'WARNING',
              code: 'DUPLICATE_STACK_ORDER',
              message: `${stackGroup} istif grubunda ${stackOrder}. sıra birden fazla satırda kullanılıyor. Aynı istif içinde sıra değerlerini benzersiz tutun.`,
              stackGroup,
            });
          }
        });

        const totalHeightCm = round(lines.reduce((sum, line) => sum + line.palletHeightCm, 0), 2);
        const totalGrossWeightKg = round(
          lines.reduce((sum, line) => sum + line.palletGrossWeightKg, 0),
        );

        const minStackOrder = Math.min(...lines.map((line) => line.stackOrder));
        const groundPalletCount = lines
          .filter((line) => line.stackOrder === minStackOrder)
          .reduce((sum, line) => sum + line.palletCount, 0);

        const exceedsStackHeightLimit =
          totalHeightCm > PACKAGING_CONSTRAINTS.MAX_STACK_HEIGHT_CM;

        if (exceedsStackHeightLimit) {
          validationMessages.push({
            level: 'WARNING',
            code: 'STACK_HEIGHT_EXCEEDED',
            message: `${stackGroup} istifi ${PACKAGING_CONSTRAINTS.MAX_STACK_HEIGHT_CM} cm limitini aşıyor.`,
            stackGroup,
          });
        }

        return {
          stackGroup,
          totalHeightCm,
          totalGrossWeightKg,
          palletLineIds: lines.map((line) => line.lineId),
          exceedsStackHeightLimit,
          groundPalletCount,
        };
      },
    );

    const stackedLineIds = new Set(
      stackSummaries.flatMap((stack) => stack.palletLineIds),
    );

    const standaloneGroundPalletCount = palletLineResults
      .filter((line) => !stackedLineIds.has(line.lineId))
      .reduce((sum, line) => sum + line.palletCount, 0);

    const totalGroundPalletCount =
      standaloneGroundPalletCount +
      stackSummaries.reduce((sum, stack) => sum + stack.groundPalletCount, 0);

    const totalContainerCount = palletLineResults.reduce(
      (sum, line) => sum + line.totalUnits,
      0,
    );

    const totalPalletCount = palletLineResults.reduce(
      (sum, line) => sum + line.palletCount,
      0,
    );

    const totalNetWeightKg = round(
      palletLineResults.reduce((sum, line) => sum + line.totalLineNetWeightKg, 0),
    );

    const totalTareWeightKg = round(
      palletLineResults.reduce((sum, line) => sum + line.totalLineTareWeightKg, 0),
    );

    const totalGrossWeightKg = round(totalNetWeightKg + totalTareWeightKg);

    if (containerMaterial && totalContainerCount > 0) {
      const expectedNetWeightKg = round(totalContainerCount * unitNetWeightKg);

      if (
        Math.abs(expectedNetWeightKg - totalQuantityKg) >
        PACKAGING_CONSTRAINTS.QUANTITY_TOLERANCE_KG
      ) {
        validationMessages.push({
          level: 'WARNING',
          code: 'QUANTITY_MISMATCH',
          message: `Hesaplanan toplam ürün miktarı (${expectedNetWeightKg} kg), girilen lot miktarı (${totalQuantityKg} kg) ile uyuşmuyor.`,
        });
      }
    }

    const hasError = validationMessages.some((message) => message.level === 'ERROR');
    const hasWarning = validationMessages.some((message) => message.level === 'WARNING');

    const validationStatus = hasError ? 'INVALID' : hasWarning ? 'WARNING' : 'VALID';

    return {
      totalQuantityKg,
      totalNetWeightKg,
      totalGrossWeightKg,
      totalTareWeightKg,
      totalContainerCount,
      totalPalletCount,
      totalGroundPalletCount,
      palletLineResults,
      stackSummaries,
      validationStatus,
      validationMessages,
    };
  }
}