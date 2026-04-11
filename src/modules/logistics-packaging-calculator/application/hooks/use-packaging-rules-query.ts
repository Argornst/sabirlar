import { useQuery } from '@tanstack/react-query';
import type { PackagingRulesRepository } from '../../domain';
import { GetPackagingRulesUseCase } from '../use-cases/get-packaging-rules.use-case';
import { logisticsPackagingQueryKeys } from '../queries/logistics-packaging.query-keys';

export function usePackagingRulesQuery(
  repository: PackagingRulesRepository,
  productId?: string,
) {
  return useQuery({
    queryKey: productId
      ? logisticsPackagingQueryKeys.rulesByProduct(productId)
      : logisticsPackagingQueryKeys.rules(),
    queryFn: async () => {
      const useCase = new GetPackagingRulesUseCase(repository);
      return useCase.execute(productId);
    },
    enabled: productId == null || productId.length > 0,
  });
}