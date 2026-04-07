import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduction } from "../../application/use-cases/createProduction";
import { productionQueryKeys } from "./useProductionsListQuery";

export const useCreateProductionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduction,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productionQueryKeys.all }),
        queryClient.refetchQueries({ queryKey: ["productions", "dispatch-plan"] }),
        queryClient.refetchQueries({ queryKey: ["productions", "list"] }),
      ]);
    },
  });
};