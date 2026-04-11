import type { PackagingCalculatorFormValues } from '../../domain';

export interface UpdatePackagingCalculationDto {
  calculationId: string;
  values: PackagingCalculatorFormValues;
}