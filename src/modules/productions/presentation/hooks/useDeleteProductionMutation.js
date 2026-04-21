import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshProductionQueries } from "../../application/queryKeys";
import { deleteProductionRecord } from "../../runtime/productions.runtime";

export const useDeleteProductionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductionRecord,
    onSuccess: async () => {
      await refreshProductionQueries(queryClient);
    },
  });
};
