import { useQuery } from '@tanstack/react-query';
import type { PackagingScenariosRepository } from '../../domain';
import { logisticsPackagingQueryKeys } from '../queries/logistics-packaging.query-keys';

export function usePackagingScenariosQuery(
  repository: PackagingScenariosRepository,
) {
  return useQuery({
    queryKey: logisticsPackagingQueryKeys.scenarios(),
    queryFn: async () => repository.getAll(),
  });
}