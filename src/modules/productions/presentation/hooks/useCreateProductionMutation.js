import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshProductionQueries } from "../../application/queryKeys";
import { createProductionRecord } from "../../runtime/productions.runtime";

export const useCreateProductionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductionRecord,
    onSuccess: async () => {
      await refreshProductionQueries(queryClient);
    },
  });
};
