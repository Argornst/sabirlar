import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { productsRepository } from "../../infrastructure/repositories/productsRepository";

export function useToggleProductActive() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ productId, nextIsActive }) =>
      productsRepository.updateActiveStatus(productId, nextIsActive),
    onSuccess: async (updatedProduct) => {
      await logActivity({
        action: AUDIT_ACTIONS.PRODUCT_STATUS_UPDATED,
        entityType: AUDIT_ENTITY_TYPES.PRODUCT,
        entityId: updatedProduct?.id ?? null,
        actorUserId: user?.id ?? null,
        actorEmail: user?.email ?? null,
        metadata: {
          is_active: updatedProduct?.isActive ?? null,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["reports-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}