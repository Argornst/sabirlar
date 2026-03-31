import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "../../../../shared/constants/audit";
import { logActivity } from "../../../../shared/lib/audit/logActivity";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

function patchUsersList(oldUsers, userId, patch) {
  if (!Array.isArray(oldUsers)) return oldUsers;

  return oldUsers.map((user) =>
    user.id === userId ? { ...user, ...patch } : user
  );
}

export function useUpdateUserOrganization() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, organizationId }) =>
      usersRepository.updateOrganization(userId, organizationId),

    onMutate: async ({ userId, organizationId }) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });

      const previousUsers = queryClient.getQueryData(["users"]);

      queryClient.setQueryData(["users"], (old) =>
        patchUsersList(old, userId, { organizationId })
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
        queryClient.setQueryData(["users"], context.previousUsers);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}