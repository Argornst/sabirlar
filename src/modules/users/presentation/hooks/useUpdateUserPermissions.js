import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

function patchUsersList(oldUsers, userId, patch) {
  if (!Array.isArray(oldUsers)) return oldUsers;

  return oldUsers.map((user) =>
    user.id === userId ? { ...user, ...patch } : user
  );
}

export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, pagePermissions }) =>
      usersRepository.updatePagePermissions(userId, pagePermissions),

    onMutate: async ({ userId, pagePermissions }) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });

      const previousUsers = queryClient.getQueryData(["users"]);

      queryClient.setQueryData(["users"], (old) =>
        patchUsersList(old, userId, { pagePermissions })
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