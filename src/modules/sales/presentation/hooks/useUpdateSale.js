import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { getReadableErrorMessage } from "../../../../shared/lib/error/getReadableErrorMessage";
import { invalidateSalesRelatedQueries } from "../../application/queryKeys";
import { updateSaleRecord } from "../../runtime/sales.runtime";

export function useUpdateSale() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ sale, values }) =>
      updateSaleRecord({
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

      await invalidateSalesRelatedQueries(queryClient);
    },

    onError: (error) => {
      console.error(
        getReadableErrorMessage(error, "Sipariş güncellenemedi.")
      );
    },
  });
}