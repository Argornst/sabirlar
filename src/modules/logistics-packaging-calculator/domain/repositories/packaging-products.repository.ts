import type { PackagingProduct } from '../entities/packaging-product.entity';

export interface PackagingProductsRepository {
  getAll(): Promise<PackagingProduct[]>;
}