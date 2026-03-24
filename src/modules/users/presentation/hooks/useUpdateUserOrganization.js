import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useUpdateUserOrganization() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, organizationId }) =>
      usersRepository.updateOrganization(userId, organizationId),
    onSuccess: async (updatedUser) => {
      await logActivity({
        action: AUDIT_ACTIONS.USER_UPDATED,
        entityType: AUDIT_ENTITY_TYPES.USER,
        entityId: updatedUser?.id ?? null,
        actorUserId: user?.id ?? null,
        actorEmail: user?.email ?? null,
        metadata: {
          organization_id: updatedUser?.organizationId ?? null,
          organization_name: updatedUser?.organizationName ?? null,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}