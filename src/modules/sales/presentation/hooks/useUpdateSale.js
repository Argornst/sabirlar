import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { updateSale } from "../../application/use-cases/updateSale";
import { salesRepository } from "../../infrastructure/repositories/salesRepository";

export function useUpdateSale() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ sale, values }) =>
      updateSale({
        salesRepository,
        sale,
        userId: user?.id ?? null,
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
          status: updatedSale?.status ?? null,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["sales"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["reports-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}