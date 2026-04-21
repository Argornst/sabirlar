import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { organizationsQueryKeys } from "../../application/queryKeys";
import { listOrganizations } from "../../runtime/organizations.runtime";

export function useOrganizationsListQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: organizationsQueryKeys.all,
    queryFn: () => listOrganizations(),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 10,
  });
}
