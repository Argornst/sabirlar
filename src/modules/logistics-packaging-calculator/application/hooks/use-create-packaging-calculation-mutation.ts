import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  PackagingCalculationsRepository,
  PackagingMaterial,
  PackagingProductMaterialRule,
} from '../../domain';
import { CreatePackagingCalculationUseCase } from '../use-cases/create-packaging-calculation.use-case';
import { logisticsPackagingQueryKeys } from '../queries/logistics-packaging.query-keys';
import type { CreatePackagingCalculationDto } from '../dto/create-packaging-calculation.dto';

interface UseCreatePackagingCalculationMutationOptions {
  calculationsRepository: PackagingCalculationsRepository;
  materials: PackagingMaterial[];
  productRules: PackagingProductMaterialRule[];
}

export function useCreatePackagingCalculationMutation(
  options: UseCreatePackagingCalculationMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreatePackagingCalculationDto) => {
      const useCase = new CreatePackagingCalculationUseCase({
        calculationsRepository: options.calculationsRepository,
      });

      return useCase.execute(dto, {
        materials: options.materials,
        productRules: options.productRules,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: logisticsPackagingQueryKeys.calculations(),
      });
    },
  });
}