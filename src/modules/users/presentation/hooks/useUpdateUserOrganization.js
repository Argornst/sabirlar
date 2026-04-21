import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { invalidateUserManagementQueries, usersQueryKeys } from "../../application/queryKeys";
import { updateUserOrganizationRecord } from "../../runtime/users.runtime";
import { patchUsersListEntry } from "./users.cache";

export function useUpdateUserOrganization() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, organizationId }) =>
      updateUserOrganizationRecord({
        userId,
        organizationId,
      }),

    onMutate: async ({ userId, organizationId }) => {
      await queryClient.cancelQueries({
        queryKey: usersQueryKeys.all,
      });

      const previousUsers = queryClient.getQueryData(usersQueryKeys.all);

      queryClient.setQueryData(usersQueryKeys.all, (old) =>
        patchUsersListEntry(old, userId, { organizationId })
      );

      return { previousUsers };
    },

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
    },

    onError: (_error, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(usersQueryKeys.all, context.previousUsers);
      }
    },

    onSettled: async () => {
      await invalidateUserManagementQueries(queryClient, {
        includeOrganizations: true,
        includeAudit: true,
      });
    },
  });
}
