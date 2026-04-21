import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { usersQueryKeys } from "../../application/queryKeys";
import { listAvailableRoles } from "../../runtime/users.runtime";

export function useRolesQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: usersQueryKeys.roles,
    queryFn: () => listAvailableRoles(),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 10,
  });
}
