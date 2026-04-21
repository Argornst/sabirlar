import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateUserAccessQueries, usersQueryKeys } from "../../application/queryKeys";
import { updateUserActiveStatus } from "../../runtime/users.runtime";
import { patchUsersListEntry } from "./users.cache";

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, nextIsActive }) =>
      updateUserActiveStatus({
        userId,
        nextIsActive,
      }),

    onMutate: async ({ userId, nextIsActive }) => {
      await queryClient.cancelQueries({
        queryKey: usersQueryKeys.all,
      });

      const previousUsers = queryClient.getQueryData(usersQueryKeys.all);

      queryClient.setQueryData(usersQueryKeys.all, (old) =>
        patchUsersListEntry(old, userId, { isActive: nextIsActive })
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
