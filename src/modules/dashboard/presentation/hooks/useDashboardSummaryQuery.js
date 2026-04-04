import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { dashboardRepository } from "../../infrastructure/repositories/dashboardRepository";

export function useDashboardSummaryQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => dashboardRepository.getSummary(),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
  });
}