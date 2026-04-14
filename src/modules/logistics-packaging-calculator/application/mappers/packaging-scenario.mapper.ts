import type {
  CreatePackagingScenarioRepositoryInput,
  PackagingCalculationResult,
  PackagingCalculatorFormValues,
  PackagingScenarioAggregateResult,
  PackagingScenarioCalculationResult,
  PackagingScenarioValues,
  PackagingValidationStatus,
  UpdatePackagingScenarioRepositoryInput,
} from '../../domain';
import { PACKAGING_CONSTRAINTS } from '../../domain';

function round(value: number, precision = 3): number {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

function resolveAggregateValidationStatus(
  messages: PackagingCalculationResult['validationMessages'],
): PackagingValidationStatus {
  const hasError = messages.some((message) => message.level === 'ERROR');
  const hasWarning = messages.some((message) => message.level === 'WARNING');

  if (hasError) return 'INVALID';
  if (hasWarning) return 'WARNING';
  return 'VALID';
}

export function buildScenarioAggregateResult(
  lotResults: Array<{
    lotId: string;
    result: PackagingCalculationResult;
  }>,
): PackagingScenarioAggregateResult {
  const sharedStackLinesMap = new Map<
    string,
    Array<
      PackagingCalculationResult['palletLineResults'][number] & {
        lotId: string;
      }
    >
  >();

  lotResults.forEach(({ lotId, result }) => {
    result.palletLineResults.forEach((line) => {
      if (!line.stackGroup) return;

      const current = sharedStackLinesMap.get(line.stackGroup) ?? [];
      current.push({ ...line, lotId });
      sharedStackLinesMap.set(line.stackGroup, current);
    });
  });

  const aggregateValidationMessages: PackagingCalculationResult['validationMessages'] =
    lotResults.flatMap(({ lotId, result }) =>
      result.validationMessages.map((message) => ({
        ...message,
        message: `[Lot ${lotId}] ${message.message}`,
      })),
    );

  const normalizedLotNumbers = lotResults
    .map(({ result }) => result.validationMessages)
    .flat();

  void normalizedLotNumbers;

  const stackSummaries = Array.from(sharedStackLinesMap.entries()).map(
    ([stackGroup, lines]) => {
      const orderGroups = new Map<number, typeof lines>();

      lines.forEach((line) => {
        const group = orderGroups.get(line.stackOrder) ?? [];
        group.push(line);
        orderGroups.set(line.stackOrder, group);
      });

      orderGroups.forEach((groupLines, stackOrder) => {
        if (groupLines.length > 1) {
          const lotLabels = Array.from(
            new Set(groupLines.map((line) => line.lotId)),
          ).join(', ');

          aggregateValidationMessages.push({
            level: 'WARNING',
            code: 'DUPLICATE_STACK_ORDER',
            message: `${stackGroup} ortak istif grubunda ${stackOrder}. sıra birden fazla lot/satırda kullanılıyor. Lotlar: ${lotLabels}.`,
            stackGroup,
          });
        }
      });

      const totalHeightCm = round(
        lines.reduce((sum, line) => sum + line.palletHeightCm, 0),
        2,
      );

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
        const lotLabels = Array.from(new Set(lines.map((line) => line.lotId))).join(', ');

        aggregateValidationMessages.push({
          level: 'WARNING',
          code: 'STACK_HEIGHT_EXCEEDED',
          message: `${stackGroup} ortak istifi ${PACKAGING_CONSTRAINTS.MAX_STACK_HEIGHT_CM} cm limitini aşıyor. İlgili lotlar: ${lotLabels}.`,
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

  const totalGroundPalletCount = stackSummaries.reduce(
    (sum, stack) => sum + stack.groundPalletCount,
    0,
  );

  return {
    totalQuantityKg: lotResults.reduce(
      (sum, item) => sum + item.result.totalQuantityKg,
      0,
    ),
    totalNetWeightKg: lotResults.reduce(
      (sum, item) => sum + item.result.totalNetWeightKg,
      0,
    ),
    totalGrossWeightKg: lotResults.reduce(
      (sum, item) => sum + item.result.totalGrossWeightKg,
      0,
    ),
    totalTareWeightKg: lotResults.reduce(
      (sum, item) => sum + item.result.totalTareWeightKg,
      0,
    ),
    totalContainerCount: lotResults.reduce(
      (sum, item) => sum + item.result.totalContainerCount,
      0,
    ),
    totalPalletCount: lotResults.reduce(
      (sum, item) => sum + item.result.totalPalletCount,
      0,
    ),
    totalGroundPalletCount,
    stackSummaries,
    validationStatus: resolveAggregateValidationStatus(aggregateValidationMessages),
    validationMessages: aggregateValidationMessages,
  };
}

function mapLots(values: PackagingScenarioValues, result: PackagingScenarioCalculationResult) {
  const resultByLotId = new Map(result.lots.map((item) => [item.lotId, item.result]));

  return values.lots.map((lot) => {
    const lotResult = resultByLotId.get(lot.id);

    if (!lotResult) {
      throw new Error(`Lot sonucu bulunamadı: ${lot.id}`);
    }

    const lotValues: PackagingCalculatorFormValues = lot.values;

    return {
      lotNumber: lotValues.lotNumber.trim(),
      productId: lotValues.productId,
      totalQuantityKg:
        lotValues.totalQuantityKg === '' ? 0 : Number(lotValues.totalQuantityKg),
      unitNetWeightKg:
        lotValues.unitNetWeightKg === '' ? null : Number(lotValues.unitNetWeightKg),
      containerMaterialId: lotValues.containerMaterialId,
      vacuumBagMaterialId: lotValues.vacuumBagMaterialId,
      notes: lotValues.notes.trim() || null,
      palletLines: lotResult.palletLineResults.map((line) => ({
        palletMaterialId: line.palletMaterialId,
        palletCount: line.palletCount,
        unitsPerRow: line.unitsPerRow,
        unitsPerPallet: line.unitsPerPallet,
        stackGroup: line.stackGroup,
        stackOrder: line.stackOrder,
      })),
    };
  });
}

export function mapScenarioValuesAndResultsToCreateRepositoryInput(
  values: PackagingScenarioValues,
  result: PackagingScenarioCalculationResult,
): CreatePackagingScenarioRepositoryInput {
  return {
    scenario: {
      name: values.name.trim() || null,
      createdBy: null,
      updatedBy: null,
    },
    lots: mapLots(values, result),
  };
}

export function mapScenarioValuesAndResultsToUpdateRepositoryInput(
  scenarioId: string,
  values: PackagingScenarioValues,
  result: PackagingScenarioCalculationResult,
): UpdatePackagingScenarioRepositoryInput {
  return {
    scenarioId,
    scenario: {
      name: values.name.trim() || null,
      updatedBy: null,
    },
    lots: mapLots(values, result),
  };
}