import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { salesRepository } from "../../infrastructure/repositories/salesRepository";

export function useDeleteSale() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ saleId, customerName }) => {
      await salesRepository.remove(saleId);
      return { saleId, customerName };
    },
    onSuccess: async ({ saleId, customerName }) => {
      await logActivity({
        action: AUDIT_ACTIONS.SALE_DELETED,
        entityType: AUDIT_ENTITY_TYPES.SALE,
        entityId: saleId,
        actorUserId: user?.id ?? null,
        actorEmail: user?.email ?? null,
        metadata: {
          customer_name: customerName ?? null,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["sales"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["reports-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}