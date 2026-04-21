import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { invalidateProductRelatedQueries } from "../../application/queryKeys";
import { deleteProductRecord } from "../../runtime/products.runtime";

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ productId, productName }) => {
      await deleteProductRecord(productId);
      return { productId, productName };
    },
    onSuccess: async ({ productId, productName }) => {
      await logActivity({
        action: AUDIT_ACTIONS.PRODUCT_DELETED,
        entityType: AUDIT_ENTITY_TYPES.PRODUCT,
        entityId: productId,
        actorUserId: user?.id ?? null,
        actorEmail: user?.email ?? null,
        metadata: {
          name: productName ?? null,
        },
      });

      await invalidateProductRelatedQueries(queryClient);
    },
  });
}
