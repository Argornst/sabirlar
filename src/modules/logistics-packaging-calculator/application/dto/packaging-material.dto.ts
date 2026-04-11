import type { PackagingMaterialType } from '../../domain';

export interface CreatePackagingMaterialDto {
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
}

export interface UpdatePackagingMaterialDto extends Partial<CreatePackagingMaterialDto> {}