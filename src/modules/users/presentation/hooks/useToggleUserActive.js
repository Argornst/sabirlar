import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, nextIsActive }) =>
      usersRepository.updateActiveStatus(userId, nextIsActive),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}