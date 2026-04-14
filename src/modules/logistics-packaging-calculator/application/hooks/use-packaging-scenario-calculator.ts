import { useMemo, useState } from 'react';
import type {
  PackagingCalculationResult,
  PackagingCalculatorFormValues,
  PackagingMaterial,
  PackagingProductMaterialRule,
  PackagingScenarioAggregateResult,
  PackagingScenarioValues,
} from '../../domain';
import { CalculatePackagingUseCase } from '../use-cases/calculate-packaging.use-case';
import { createDefaultPackagingCalculatorFormValues } from '../mappers/packaging-form.mapper';
import { buildScenarioAggregateResult } from '../mappers/packaging-scenario.mapper';

function createDefaultLotValues(): PackagingCalculatorFormValues {
  return createDefaultPackagingCalculatorFormValues();
}

function createDefaultScenarioValues(): PackagingScenarioValues {
  return {
    name: '',
    lots: [
      {
        id: crypto.randomUUID(),
        values: createDefaultLotValues(),
      },
    ],
  };
}

interface UsePackagingScenarioCalculatorOptions {
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
  initialValues?: PackagingScenarioValues;
}

interface UsePackagingScenarioCalculatorReturn {
  values: PackagingScenarioValues;
  setScenarioName: (name: string) => void;
  setScenarioValues: (
    updater:
      | PackagingScenarioValues
      | ((current: PackagingScenarioValues) => PackagingScenarioValues),
  ) => void;
  loadScenario: (nextValues: PackagingScenarioValues) => void;
  duplicateScenario: (nextValues: PackagingScenarioValues) => void;
  updateLotValues: (
    lotId: string,
    updater:
      | PackagingCalculatorFormValues
      | ((current: PackagingCalculatorFormValues) => PackagingCalculatorFormValues),
  ) => void;
  addLot: () => void;
  removeLot: (lotId: string) => void;
  addPalletLine: (lotId: string, preferredPalletId?: string) => void;
  removePalletLine: (lotId: string, lineId: string) => void;
  getLotResult: (lotId: string) => PackagingCalculationResult;
  aggregateResult: PackagingScenarioAggregateResult;
  reset: () => void;
}

export function usePackagingScenarioCalculator(
  options: UsePackagingScenarioCalculatorOptions,
): UsePackagingScenarioCalculatorReturn {
  const [values, setValues] = useState<PackagingScenarioValues>(
    options.initialValues ?? createDefaultScenarioValues(),
  );

  const calculatePackagingUseCase = useMemo(
    () => new CalculatePackagingUseCase(),
    [],
  );

  const lotResultsMap = useMemo(() => {
    return new Map(
      values.lots.map((lot) => {
        const lotRules = options.productRules.filter(
          (rule) => rule.productId === lot.values.productId,
        );

        const result = calculatePackagingUseCase.execute({
          values: lot.values,
          materials: options.materials,
          productRules: lotRules,
        });

        return [lot.id, result];
      }),
    );
  }, [calculatePackagingUseCase, options.materials, options.productRules, values.lots]);

  const aggregateResult = useMemo(
    () =>
      buildScenarioAggregateResult(
        values.lots.map((lot) => ({
          lotId: lot.id,
          result:
            lotResultsMap.get(lot.id) ??
            calculatePackagingUseCase.execute({
              values: lot.values,
              materials: options.materials,
              productRules: options.productRules.filter(
                (rule) => rule.productId === lot.values.productId,
              ),
            }),
        })),
      ),
    [calculatePackagingUseCase, lotResultsMap, options.materials, options.productRules, values.lots],
  );

  const setScenarioName = (name: string) => {
    setValues((current) => ({
      ...current,
      name,
    }));
  };

  const setScenarioValues = (
    updater:
      | PackagingScenarioValues
      | ((current: PackagingScenarioValues) => PackagingScenarioValues),
  ) => {
    setValues((current) =>
      typeof updater === 'function' ? updater(current) : updater,
    );
  };

  const loadScenario = (nextValues: PackagingScenarioValues) => {
    setValues(nextValues);
  };

  const duplicateScenario = (nextValues: PackagingScenarioValues) => {
    setValues(nextValues);
  };

  const updateLotValues = (
    lotId: string,
    updater:
      | PackagingCalculatorFormValues
      | ((current: PackagingCalculatorFormValues) => PackagingCalculatorFormValues),
  ) => {
    setValues((current) => ({
      ...current,
      lots: current.lots.map((lot) => {
        if (lot.id !== lotId) {
          return lot;
        }

        const nextValues =
          typeof updater === 'function' ? updater(lot.values) : updater;

        return {
          ...lot,
          values: nextValues,
        };
      }),
    }));
  };

  const addLot = () => {
    setValues((current) => ({
      ...current,
      lots: [
        ...current.lots,
        {
          id: crypto.randomUUID(),
          values: createDefaultLotValues(),
        },
      ],
    }));
  };

  const removeLot = (lotId: string) => {
    setValues((current) => ({
      ...current,
      lots:
        current.lots.length === 1
          ? current.lots
          : current.lots.filter((lot) => lot.id !== lotId),
    }));
  };

  const addPalletLine = (lotId: string, preferredPalletId = '') => {
    updateLotValues(lotId, (current) => ({
      ...current,
      palletLines: [
        ...current.palletLines,
        {
          id: crypto.randomUUID(),
          palletMaterialId: preferredPalletId,
          palletCount: 1,
          unitsPerRow: '',
          unitsPerPallet: '',
          stackGroup: '',
          stackOrder: 1,
        },
      ],
    }));
  };

  const removePalletLine = (lotId: string, lineId: string) => {
    updateLotValues(lotId, (current) => ({
      ...current,
      palletLines:
        current.palletLines.length === 1
          ? current.palletLines
          : current.palletLines.filter((line) => line.id !== lineId),
    }));
  };

  const getLotResult = (lotId: string) => {
    const result = lotResultsMap.get(lotId);

    if (result) {
      return result;
    }

    const lot = values.lots.find((item) => item.id === lotId);

    if (!lot) {
      throw new Error(`Lot bulunamadı: ${lotId}`);
    }

    return calculatePackagingUseCase.execute({
      values: lot.values,
      materials: options.materials,
      productRules: options.productRules.filter(
        (rule) => rule.productId === lot.values.productId,
      ),
    });
  };

  const reset = () => {
    setValues(createDefaultScenarioValues());
  };

  return {
    values,
    setScenarioName,
    setScenarioValues,
    loadScenario,
    duplicateScenario,
    updateLotValues,
    addLot,
    removeLot,
    addPalletLine,
    removePalletLine,
    getLotResult,
    aggregateResult,
    reset,
  };
}