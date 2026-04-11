import type { PackagingCalculation } from '../entities/packaging-calculation.entity';
import type { PackagingCalculationPalletLine } from '../entities/packaging-pallet-line.entity';

export interface PackagingCalculationWithLines {
  calculation: PackagingCalculation;
  palletLines: PackagingCalculationPalletLine[];
}

export interface CreatePackagingCalculationRepositoryInput {
  calculation: Omit<
    PackagingCalculation,
    'id' | 'createdAt' | 'updatedAt'
  >;
  palletLines: Omit<
    PackagingCalculationPalletLine,
    'id' | 'calculationId' | 'createdAt'
  >[];
}

export interface UpdatePackagingCalculationRepositoryInput {
  calculationId: string;
  calculation: Partial<
    Omit<PackagingCalculation, 'id' | 'createdAt' | 'updatedAt'>
  >;
  palletLines: Omit<
    PackagingCalculationPalletLine,
    'id' | 'calculationId' | 'createdAt'
  >[];
}

export interface PackagingCalculationsRepository {
  getAll(): Promise<PackagingCalculationWithLines[]>;
  getById(id: string): Promise<PackagingCalculationWithLines | null>;
  create(input: CreatePackagingCalculationRepositoryInput): Promise<PackagingCalculationWithLines>;
  update(input: UpdatePackagingCalculationRepositoryInput): Promise<PackagingCalculationWithLines>;
}