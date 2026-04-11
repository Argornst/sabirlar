import {
  PackagingCalculatorService,
  type PackagingCalculationResult,
  type PackagingCalculatorFormValues,
  type PackagingMaterial,
  type PackagingProductMaterialRule,
} from '../../domain';

interface CalculatePackagingUseCaseInput {
  values: PackagingCalculatorFormValues;
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
}

export class CalculatePackagingUseCase {
  private readonly calculatorService = new PackagingCalculatorService();

  execute(input: CalculatePackagingUseCaseInput): PackagingCalculationResult {
    return this.calculatorService.calculate(input.values, {
      materials: input.materials,
      productRules: input.productRules,
    });
  }
}