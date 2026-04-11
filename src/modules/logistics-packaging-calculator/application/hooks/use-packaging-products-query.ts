import { useQuery } from '@tanstack/react-query';
import type { PackagingProductsRepository } from '../../domain';
import { GetPackagingProductsUseCase } from '../use-cases/get-packaging-products.use-case';
import { logisticsPackagingQueryKeys } from '../queries/logistics-packaging.query-keys';

export function usePackagingProductsQuery(
  repository: PackagingProductsRepository,
) {
  return useQuery({
    queryKey: logisticsPackagingQueryKeys.products(),
    queryFn: async () => {
      const useCase = new GetPackagingProductsUseCase(repository);
      return useCase.execute();
    },
  });
}