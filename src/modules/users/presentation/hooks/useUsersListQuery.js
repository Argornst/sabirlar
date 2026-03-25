import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useUsersListQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["users"],
    queryFn: () => usersRepository.getAll(),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
  });
}