import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { invalidateProductRelatedQueries } from "../../application/queryKeys";
import { updateProductRecord } from "../../runtime/products.runtime";

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ productId, values }) =>
      updateProductRecord({
        productId,
        values,
      }),
    onSuccess: async (updatedProduct) => {
      await logActivity({
        action: AUDIT_ACTIONS.PRODUCT_UPDATED,
        entityType: AUDIT_ENTITY_TYPES.PRODUCT,
        entityId: updatedProduct?.id ?? null,
        actorUserId: user?.id ?? null,
        actorEmail: user?.email ?? null,
        metadata: {
          name: updatedProduct?.name ?? null,
        },
      });

      await invalidateProductRelatedQueries(queryClient);
    },
  });
}
