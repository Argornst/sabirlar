import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }) =>
      usersRepository.updateRole(userId, roleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}