import type { PackagingMaterial, PackagingMaterialsRepository } from '../../domain';

export class GetPackagingMaterialsUseCase {
  constructor(private readonly repository: PackagingMaterialsRepository) {}

  execute(): Promise<PackagingMaterial[]> {
    return this.repository.getAll();
  }
}