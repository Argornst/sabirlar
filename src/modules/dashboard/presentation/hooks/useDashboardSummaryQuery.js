import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { dashboardQueryKeys } from "../../application/queryKeys";
import { getDashboardSummarySnapshot } from "../../runtime/dashboard.runtime";

export function useDashboardSummaryQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: dashboardQueryKeys.summary,
    queryFn: () => getDashboardSummarySnapshot(),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
  });
}
