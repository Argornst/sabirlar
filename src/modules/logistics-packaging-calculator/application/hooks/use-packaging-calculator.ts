import { useMemo, useState } from 'react';
import type {
  PackagingCalculationResult,
  PackagingCalculatorFormValues,
  PackagingMaterial,
  PackagingProductMaterialRule,
} from '../../domain';
import { CalculatePackagingUseCase } from '../use-cases/calculate-packaging.use-case';
import { createDefaultPackagingCalculatorFormValues } from '../mappers/packaging-form.mapper';

interface UsePackagingCalculatorOptions {
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
  initialValues?: PackagingCalculatorFormValues;
}

interface UsePackagingCalculatorReturn {
  values: PackagingCalculatorFormValues;
  setValues: React.Dispatch<React.SetStateAction<PackagingCalculatorFormValues>>;
  result: PackagingCalculationResult;
  addPalletLine: () => void;
  removePalletLine: (lineId: string) => void;
  reset: () => void;
}

export function usePackagingCalculator(
  options: UsePackagingCalculatorOptions,
): UsePackagingCalculatorReturn {
  const [values, setValues] = useState<PackagingCalculatorFormValues>(
    options.initialValues ?? createDefaultPackagingCalculatorFormValues(),
  );

  const calculatePackagingUseCase = useMemo(
    () => new CalculatePackagingUseCase(),
    [],
  );

  const result = useMemo(
    () =>
      calculatePackagingUseCase.execute({
        values,
        materials: options.materials,
        productRules: options.productRules,
      }),
    [calculatePackagingUseCase, options.materials, options.productRules, values],
  );

  const addPalletLine = () => {
    setValues((current) => ({
      ...current,
      palletLines: [
        ...current.palletLines,
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
    }));
  };

  const removePalletLine = (lineId: string) => {
    setValues((current) => ({
      ...current,
      palletLines:
        current.palletLines.length === 1
          ? current.palletLines
          : current.palletLines.filter((line) => line.id !== lineId),
    }));
  };

  const reset = () => {
    setValues(createDefaultPackagingCalculatorFormValues());
  };

  return {
    values,
    setValues,
    result,
    addPalletLine,
    removePalletLine,
    reset,
  };
}