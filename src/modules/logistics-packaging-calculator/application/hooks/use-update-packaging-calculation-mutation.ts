import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  PackagingCalculationsRepository,
  PackagingMaterial,
  PackagingProductMaterialRule,
} from '../../domain';
import { UpdatePackagingCalculationUseCase } from '../use-cases/update-packaging-calculation.use-case';
import { logisticsPackagingQueryKeys } from '../queries/logistics-packaging.query-keys';
import type { UpdatePackagingCalculationDto } from '../dto/update-packaging-calculation.dto';

interface UseUpdatePackagingCalculationMutationOptions {
  calculationsRepository: PackagingCalculationsRepository;
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
}

export function useUpdatePackagingCalculationMutation(
  options: UseUpdatePackagingCalculationMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdatePackagingCalculationDto) => {
      const useCase = new UpdatePackagingCalculationUseCase({
        calculationsRepository: options.calculationsRepository,
      });

      return useCase.execute(dto, {
        materials: options.materials,
        productRules: options.productRules,
      });
    },
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: logisticsPackagingQueryKeys.calculations(),
        }),
        queryClient.invalidateQueries({
          queryKey: logisticsPackagingQueryKeys.calculation(result.calculation.id),
        }),
      ]);
    },
  });
}