import type { PackagingMaterialType } from '../enums/packaging-material-type.enum';

export interface PackagingCalculationsFilters {
  search?: string;
  lotNumber?: string;
  productId?: string;
}

export interface PackagingMaterialsFilters {
  search?: string;
  materialType?: PackagingMaterialType | 'ALL';
  isActive?: boolean;
}