import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateUserAccessQueries, usersQueryKeys } from "../../application/queryKeys";
import { updateUserPagePermissions } from "../../runtime/users.runtime";
import { patchUsersListEntry } from "./users.cache";

export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, pagePermissions }) =>
      updateUserPagePermissions({
        userId,
        pagePermissions,
      }),

    onMutate: async ({ userId, pagePermissions }) => {
      await queryClient.cancelQueries({
        queryKey: usersQueryKeys.all,
      });

      const previousUsers = queryClient.getQueryData(usersQueryKeys.all);

      queryClient.setQueryData(usersQueryKeys.all, (old) =>
        patchUsersListEntry(old, userId, { pagePermissions })
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
