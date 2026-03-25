import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { getUsersList } from "../../application/use-cases/getUsersList";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useUsersListQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["users"],
    queryFn: () => getUsersList({ usersRepository }),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 2,
  });
}