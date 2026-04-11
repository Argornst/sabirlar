import type { PackagingMaterial } from '../entities/packaging-material.entity';

export interface PackagingMaterialsRepository {
  getAll(): Promise<PackagingMaterial[]>;
  getById(id: string): Promise<PackagingMaterial | null>;
  create(input: Omit<PackagingMaterial, 'id' | 'createdAt' | 'updatedAt'>): Promise<PackagingMaterial>;
  update(id: string, input: Partial<Omit<PackagingMaterial, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PackagingMaterial>;
}