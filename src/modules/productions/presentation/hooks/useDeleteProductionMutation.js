import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduction } from "../../application/use-cases/deleteProduction";
import { productionQueryKeys } from "./useProductionsListQuery";

export const useDeleteProductionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduction,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productionQueryKeys.all }),
        queryClient.refetchQueries({ queryKey: ["productions", "dispatch-plan"] }),
        queryClient.refetchQueries({ queryKey: ["productions", "list"] }),
      ]);
    },
  });
};