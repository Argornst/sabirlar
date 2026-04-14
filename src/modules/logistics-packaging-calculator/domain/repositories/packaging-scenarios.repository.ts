export interface CreatePackagingScenarioRepositoryInput {
  scenario: {
    name: string | null;
    createdBy: string | null;
  };
  lots: Array<{
    lotNumber: string;
    productId: string;
    totalQuantityKg: number;
    unitNetWeightKg: number | null;
    containerMaterialId: string;
    vacuumBagMaterialId: string | null;
    notes: string | null;
    palletLines: Array<{
      palletMaterialId: string;
      palletCount: number;
      unitsPerRow: number;
      unitsPerPallet: number;
      stackGroup: string | null;
      stackOrder: number;
    }>;
  }>;
}

export interface PackagingScenarioRecord {
  id: string;
  name: string | null;
  organizationId: number | string;
  createdBy: string | null;
  createdAt: string;
}

export interface PackagingScenarioLotRecord {
  id: string;
  scenarioId: string;
  organizationId: number | string;
  lotNumber: string;
  productId: string;
  totalQuantityKg: number;
  unitNetWeightKg: number | null;
  containerMaterialId: string;
  vacuumBagMaterialId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PackagingScenarioPalletLineRecord {
  id: string;
  lotId: string;
  organizationId: number | string;
  palletMaterialId: string;
  palletCount: number;
  unitsPerRow: number;
  unitsPerPallet: number;
  stackGroup: string | null;
  stackOrder: number;
  createdAt: string;
}

export interface PackagingScenarioWithLots {
  scenario: PackagingScenarioRecord;
  lots: Array<{
    lot: PackagingScenarioLotRecord;
    palletLines: PackagingScenarioPalletLineRecord[];
  }>;
}

export interface PackagingScenariosRepository {
  getAll(): Promise<PackagingScenarioWithLots[]>;
  create(
    input: CreatePackagingScenarioRepositoryInput,
  ): Promise<PackagingScenarioWithLots>;
  delete(id: string): Promise<void>;
}