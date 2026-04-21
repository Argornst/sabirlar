import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDefaultPagePermissionsByRoleName } from "../../../../shared/lib/permissions";
import { invalidateUserAccessQueries, usersQueryKeys } from "../../application/queryKeys";
import { updateUserPagePermissions } from "../../runtime/users.runtime";
import { patchUsersListEntry } from "./users.cache";

export function useResetUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleName }) => {
      const defaults = getDefaultPagePermissionsByRoleName(roleName);
      return updateUserPagePermissions({
        userId,
        pagePermissions: defaults,
      });
    },

    onMutate: async ({ userId, roleName }) => {
      const defaults = getDefaultPagePermissionsByRoleName(roleName);

      await queryClient.cancelQueries({
        queryKey: usersQueryKeys.all,
      });

      const previousUsers = queryClient.getQueryData(usersQueryKeys.all);

      queryClient.setQueryData(usersQueryKeys.all, (old) =>
        patchUsersListEntry(old, userId, { pagePermissions: defaults })
      );

      return { previousUsers };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(usersQueryKeys.all, context.previousUsers);
      }
    },

    onSettled: async () => {
      await invalidateUserAccessQueries(queryClient);
    },
  });
}
