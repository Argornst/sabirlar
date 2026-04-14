import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PackagingScenariosRepository } from '../../domain';
import { logisticsPackagingQueryKeys } from '../queries/logistics-packaging.query-keys';

export function useDeletePackagingScenarioMutation(
  repository: PackagingScenariosRepository,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scenarioId: string) => {
      await repository.delete(scenarioId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: logisticsPackagingQueryKeys.scenarios(),
      });
    },
  });
}