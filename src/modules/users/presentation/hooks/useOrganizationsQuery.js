import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { usersQueryKeys } from "../../application/queryKeys";
import { listAvailableOrganizations } from "../../runtime/users.runtime";

export function useOrganizationsQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: usersQueryKeys.organizations,
    queryFn: () => listAvailableOrganizations(),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 10,
  });
}
