import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  PackagingMaterial,
  PackagingProductMaterialRule,
  PackagingScenariosRepository,
} from '../../domain';
import { CreatePackagingScenarioUseCase } from '../use-cases/create-packaging-scenario.use-case';
import type { CreatePackagingScenarioDto } from '../dto/create-packaging-scenario.dto';
import { logisticsPackagingQueryKeys } from '../queries/logistics-packaging.query-keys';

interface UseCreatePackagingScenarioMutationOptions {
  scenariosRepository: PackagingScenariosRepository;
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
}

export function useCreatePackagingScenarioMutation(
  options: UseCreatePackagingScenarioMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreatePackagingScenarioDto) => {
      const useCase = new CreatePackagingScenarioUseCase({
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