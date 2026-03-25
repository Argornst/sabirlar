import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";

export function useReportsSummaryQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["reports-summary"],
    queryFn: async () => {
      // geçici boş veri
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalUsers: 0,
      };
    },
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
  });
}