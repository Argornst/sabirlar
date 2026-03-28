import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDefaultPagePermissionsByRoleName } from "../../../../shared/lib/permissions";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

function patchUsersList(oldUsers, userId, patch) {
  if (!Array.isArray(oldUsers)) return oldUsers;

  return oldUsers.map((user) =>
    user.id === userId ? { ...user, ...patch } : user
  );
}

export function useResetUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleName }) => {
      const defaults = getDefaultPagePermissionsByRoleName(roleName);
      return usersRepository.updatePagePermissions(userId, defaults);
    },

    onMutate: async ({ userId, roleName }) => {
      const defaults = getDefaultPagePermissionsByRoleName(roleName);

      await queryClient.cancelQueries({ queryKey: ["users"] });

      const previousUsers = queryClient.getQueryData(["users"]);

      queryClient.setQueryData(["users"], (old) =>
        patchUsersList(old, userId, { pagePermissions: defaults })
      );

      return { previousUsers };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}