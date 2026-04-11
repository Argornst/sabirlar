import type { PackagingMaterialType } from '../enums/packaging-material-type.enum';

export interface PackagingMaterial {
  id: string;
  code: string;
  name: string;
  materialType: PackagingMaterialType;
  tareWeightKg: number;
  widthCm: number | null;
  lengthCm: number | null;
  heightCm: number | null;
  isStackable: boolean;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}