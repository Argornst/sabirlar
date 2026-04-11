import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PackagingRulesRepository } from '../../domain';
import { UpsertPackagingRulesUseCase } from '../use-cases/upsert-packaging-rules.use-case';
import { logisticsPackagingQueryKeys } from '../queries/logistics-packaging.query-keys';
import type { UpsertPackagingRulesDto } from '../dto/upsert-packaging-rules.dto';

export function useUpsertPackagingRulesMutation(
  repository: PackagingRulesRepository,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpsertPackagingRulesDto) => {
      const useCase = new UpsertPackagingRulesUseCase(repository);
      return useCase.execute(dto);
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: logisticsPackagingQueryKeys.rules(),
        }),
        queryClient.invalidateQueries({
          queryKey: logisticsPackagingQueryKeys.rulesByProduct(variables.productId),
        }),
      ]);
    },
  });
}