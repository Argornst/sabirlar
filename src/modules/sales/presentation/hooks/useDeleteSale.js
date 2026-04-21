import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateSalesRelatedQueries } from "../../application/queryKeys";
import { deleteSaleRecord } from "../../runtime/sales.runtime";

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSaleRecord,
    onSuccess: async () => {
      await invalidateSalesRelatedQueries(queryClient);
    },
  });
}