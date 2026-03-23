import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, pagePermissions }) =>
      usersRepository.updatePagePermissions(userId, pagePermissions),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}