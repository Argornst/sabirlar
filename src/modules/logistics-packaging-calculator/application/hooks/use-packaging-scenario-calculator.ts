import { useMemo, useRef, useState } from 'react';
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

function normalizeScenarioValues(values: PackagingScenarioValues) {
  return JSON.stringify({
    name: values.name.trim(),
    lots: values.lots.map((lot) => ({
      values: {
        lotNumber: lot.values.lotNumber.trim(),
        productId: lot.values.productId,
        totalQuantityKg: lot.values.totalQuantityKg === '' ? '' : Number(lot.values.totalQuantityKg),
        containerMaterialId: lot.values.containerMaterialId,
        vacuumBagMaterialId: lot.values.vacuumBagMaterialId ?? null,
        unitNetWeightKg:
          lot.values.unitNetWeightKg === '' ? '' : Number(lot.values.unitNetWeightKg),
        notes: lot.values.notes.trim(),
        palletLines: lot.values.palletLines.map((line) => ({
          palletMaterialId: line.palletMaterialId,
          palletCount: line.palletCount === '' ? '' : Number(line.palletCount),
          unitsPerRow: line.unitsPerRow === '' ? '' : Number(line.unitsPerRow),
          unitsPerPallet: line.unitsPerPallet === '' ? '' : Number(line.unitsPerPallet),
          stackGroup: line.stackGroup.trim(),
          stackOrder: line.stackOrder === '' ? '' : Number(line.stackOrder),
        })),
      },
    })),
  });
}

interface UsePackagingScenarioCalculatorOptions {
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
  initialValues?: PackagingScenarioValues;
}

interface UsePackagingScenarioCalculatorReturn {
  values: PackagingScenarioValues;
  editingScenarioId: string | null;
  isDirty: boolean;
  setScenarioName: (name: string) => void;
  setScenarioValues: (
    updater:
      | PackagingScenarioValues
      | ((current: PackagingScenarioValues) => PackagingScenarioValues),
  ) => void;
  startCreateMode: () => void;
  loadScenario: (scenarioId: string, nextValues: PackagingScenarioValues) => void;
  duplicateScenario: (nextValues: PackagingScenarioValues) => void;
  updateLotValues: (
    lotId: string,
    updater:
      | PackagingCalculatorFormValues
      | ((current: PackagingCalculatorFormValues) => PackagingCalculatorFormValues),
  ) => void;
  addLot: () => void;
  removeLot: (lotId: string) => void;
  moveLotUp: (lotId: string) => void;
  moveLotDown: (lotId: string) => void;
  addPalletLine: (lotId: string, preferredPalletId?: string) => void;
  removePalletLine: (lotId: string, lineId: string) => void;
  getLotResult: (lotId: string) => PackagingCalculationResult;
  aggregateResult: PackagingScenarioAggregateResult;
  markSaved: (scenarioId?: string | null) => void;
  reset: () => void;
}

export function usePackagingScenarioCalculator(
  options: UsePackagingScenarioCalculatorOptions,
): UsePackagingScenarioCalculatorReturn {
  const [values, setValues] = useState<PackagingScenarioValues>(
    options.initialValues ?? createDefaultScenarioValues(),
  );
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  const initialSnapshotRef = useRef(normalizeScenarioValues(options.initialValues ?? createDefaultScenarioValues()));

  const calculatePackagingUseCase = useMemo(
    () => new CalculatePackagingUseCase(),
    [],
  );

  const isDirty = normalizeScenarioValues(values) !== initialSnapshotRef.current;

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

  const startCreateMode = () => {
    const next = createDefaultScenarioValues();
    setValues(next);
    setEditingScenarioId(null);
    initialSnapshotRef.current = normalizeScenarioValues(next);
  };

  const loadScenario = (scenarioId: string, nextValues: PackagingScenarioValues) => {
    setValues(nextValues);
    setEditingScenarioId(scenarioId);
    initialSnapshotRef.current = normalizeScenarioValues(nextValues);
  };

  const duplicateScenario = (nextValues: PackagingScenarioValues) => {
    setValues(nextValues);
    setEditingScenarioId(null);
    initialSnapshotRef.current = normalizeScenarioValues(nextValues);
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

  const moveLotUp = (lotId: string) => {
    setValues((current) => {
      const index = current.lots.findIndex((lot) => lot.id === lotId);

      if (index <= 0) {
        return current;
      }

      const nextLots = [...current.lots];
      const [item] = nextLots.splice(index, 1);
      nextLots.splice(index - 1, 0, item);

      return {
        ...current,
        lots: nextLots,
      };
    });
  };

  const moveLotDown = (lotId: string) => {
    setValues((current) => {
      const index = current.lots.findIndex((lot) => lot.id === lotId);

      if (index < 0 || index >= current.lots.length - 1) {
        return current;
      }

      const nextLots = [...current.lots];
      const [item] = nextLots.splice(index, 1);
      nextLots.splice(index + 1, 0, item);

      return {
        ...current,
        lots: nextLots,
      };
    });
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

  const markSaved = (scenarioId?: string | null) => {
    initialSnapshotRef.current = normalizeScenarioValues(values);
    setEditingScenarioId(scenarioId ?? null);
  };

  const reset = () => {
    startCreateMode();
  };

  return {
    values,
    editingScenarioId,
    isDirty,
    setScenarioName,
    setScenarioValues,
    startCreateMode,
    loadScenario,
    duplicateScenario,
    updateLotValues,
    addLot,
    removeLot,
    moveLotUp,
    moveLotDown,
    addPalletLine,
    removePalletLine,
    getLotResult,
    aggregateResult,
    markSaved,
    reset,
  };
}