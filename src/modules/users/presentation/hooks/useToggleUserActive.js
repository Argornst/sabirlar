import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

function patchUsersList(oldUsers, userId, patch) {
  if (!Array.isArray(oldUsers)) return oldUsers;

  return oldUsers.map((user) =>
    user.id === userId ? { ...user, ...patch } : user
  );
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, nextIsActive }) =>
      usersRepository.updateActiveStatus(userId, nextIsActive),

    onMutate: async ({ userId, nextIsActive }) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });

      const previousUsers = queryClient.getQueryData(["users"]);

      queryClient.setQueryData(["users"], (old) =>
        patchUsersList(old, userId, { isActive: nextIsActive })
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
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}