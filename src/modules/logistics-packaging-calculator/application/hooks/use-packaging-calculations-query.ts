import { useQuery } from '@tanstack/react-query';
import type { PackagingCalculationsRepository } from '../../domain';
import { logisticsPackagingQueryKeys } from '../queries/logistics-packaging.query-keys';

export function usePackagingCalculationsQuery(
  repository: PackagingCalculationsRepository,
) {
  return useQuery({
    queryKey: logisticsPackagingQueryKeys.calculations(),
    queryFn: async () => repository.getAll(),
  });
}