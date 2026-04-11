import type { PackagingProduct, PackagingProductsRepository } from '../../domain';

export class GetPackagingProductsUseCase {
  constructor(private readonly repository: PackagingProductsRepository) {}

  execute(): Promise<PackagingProduct[]> {
    return this.repository.getAll();
  }
}