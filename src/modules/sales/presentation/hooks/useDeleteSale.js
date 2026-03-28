import { useMutation, useQueryClient } from "@tanstack/react-query";
import { salesRepository } from "../../infrastructure/repositories/salesRepository";

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleId) => {
      if (saleId == null || saleId === "") {
        throw new Error("Silinecek sipariş ID bilgisi bulunamadı.");
      }

      await salesRepository.remove(saleId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sales"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["reports-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}