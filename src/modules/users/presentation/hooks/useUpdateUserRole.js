import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateUserAccessQueries } from "../../application/queryKeys";
import { updateUserRoleRecord } from "../../runtime/users.runtime";

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }) =>
      updateUserRoleRecord({
        userId,
        roleId,
      }),
    onSuccess: async () => {
      await invalidateUserAccessQueries(queryClient);
    },
  });
}
