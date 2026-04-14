import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  PackagingMaterial,
  PackagingProductMaterialRule,
  PackagingScenariosRepository,
} from '../../domain';
import { UpdatePackagingScenarioUseCase } from '../use-cases/update-packaging-scenario.use-case';
import type { UpdatePackagingScenarioDto } from '../dto/update-packaging-scenario.dto';
import { logisticsPackagingQueryKeys } from '../queries/logistics-packaging.query-keys';

interface UseUpdatePackagingScenarioMutationOptions {
  scenariosRepository: PackagingScenariosRepository;
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
}

export function useUpdatePackagingScenarioMutation(
  options: UseUpdatePackagingScenarioMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdatePackagingScenarioDto) => {
      const useCase = new UpdatePackagingScenarioUseCase({
        scenariosRepository: options.scenariosRepository,
      });

      return useCase.execute(dto, {
        materials: options.materials,
        productRules: options.productRules,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: logisticsPackagingQueryKeys.scenarios(),
      });
    },
  });
}