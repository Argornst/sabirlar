import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduction } from "../../application/use-cases/updateProduction";
import { productionQueryKeys } from "./useProductionsListQuery";

export const useUpdateProductionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduction,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productionQueryKeys.all }),
        queryClient.refetchQueries({ queryKey: ["productions", "dispatch-plan"] }),
        queryClient.refetchQueries({ queryKey: ["productions", "list"] }),
      ]);
    },
  });
};