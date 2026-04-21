import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { usersQueryKeys } from "../../application/queryKeys";
import { listUsers } from "../../runtime/users.runtime";

export function useUsersListQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: usersQueryKeys.all,
    queryFn: () => listUsers(),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 2,
  });
}
