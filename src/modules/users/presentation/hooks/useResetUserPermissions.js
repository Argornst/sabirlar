import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDefaultPagePermissionsByRoleName } from "../../../../shared/lib/permissions";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useResetUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleName }) => {
      const defaults = getDefaultPagePermissionsByRoleName(roleName);
      return usersRepository.updatePagePermissions(userId, defaults);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}