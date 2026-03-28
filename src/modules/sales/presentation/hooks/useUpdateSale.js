import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { getReadableErrorMessage } from "../../../../shared/lib/error/getReadableErrorMessage";
import { updateSale } from "../../application/use-cases/updateSale";
import { salesRepository } from "../../infrastructure/repositories/salesRepository";
import { productsRepository } from "../../../products/infrastructure/repositories/productsRepository";

export function useUpdateSale() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ sale, values }) =>
      updateSale({
        salesRepository,
        productsRepository,
        userId: user?.id ?? null,
        sale,
        values,
      }),

    onSuccess: async (updatedSale) => {
      await logActivity({
        action: AUDIT_ACTIONS.SALE_UPDATED,
        entityType: AUDIT_ENTITY_TYPES.SALE,
        entityId: updatedSale?.id ?? null,
        actorUserId: user?.id ?? null,
        actorEmail: user?.email ?? null,
        metadata: {
          customer_name: updatedSale?.customerName ?? null,
          total_amount: updatedSale?.totalAmount ?? null,
          item_count: updatedSale?.items?.length ?? 0,
          payment_status: updatedSale?.paymentStatus ?? null,
          invoice_status: updatedSale?.invoiceStatus ?? null,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["sales"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["reports-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },

    onError: (error) => {
      console.error(
        getReadableErrorMessage(error, "Sipariş güncellenemedi.")
      );
    },
  });
}