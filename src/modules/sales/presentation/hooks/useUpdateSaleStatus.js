import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { invalidateSalesRelatedQueries } from "../../application/queryKeys";
import { updateSaleRecordStatus } from "../../runtime/sales.runtime";

export function useUpdateSaleStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ saleId, nextStatus }) =>
      updateSaleRecordStatus({
        saleId,
        nextStatus,
        actorUserId: user?.id ?? null,
      }),

    onSuccess: async (updatedSale) => {
      await logActivity({
        action: AUDIT_ACTIONS.SALE_STATUS_UPDATED,
        entityType: AUDIT_ENTITY_TYPES.SALE,
        entityId: updatedSale?.id ?? null,
        actorUserId: user?.id ?? null,
        actorEmail: user?.email ?? null,
        metadata: {
          status: updatedSale?.status ?? null,
          payment_status: updatedSale?.paymentStatus ?? null,
          invoice_status: updatedSale?.invoiceStatus ?? null,
        },
      });

      await invalidateSalesRelatedQueries(queryClient);
    },
  });
}