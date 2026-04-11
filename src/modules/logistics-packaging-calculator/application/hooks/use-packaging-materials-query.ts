import { useQuery } from '@tanstack/react-query';
import type { PackagingMaterialsRepository } from '../../domain';
import { GetPackagingMaterialsUseCase } from '../use-cases/get-packaging-materials.use-case';
import { logisticsPackagingQueryKeys } from '../queries/logistics-packaging.query-keys';

export function usePackagingMaterialsQuery(
  repository: PackagingMaterialsRepository,
) {
  return useQuery({
    queryKey: logisticsPackagingQueryKeys.materials(),
    queryFn: async () => {
      const useCase = new GetPackagingMaterialsUseCase(repository);
      return useCase.execute();
    },
  });
}