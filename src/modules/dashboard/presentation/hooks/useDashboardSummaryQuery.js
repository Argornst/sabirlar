import { useQuery } from "@tanstack/react-query";
import { dashboardRepository } from "../../infrastructure/repositories/dashboardRepository";

export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const result = await dashboardRepository.getSummary();
      return result ?? null;
    },
    retry: 0,
  });
}