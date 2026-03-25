import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { auditRepository } from "../../../../shared/lib/audit/auditRepository";

export function useAuditLogsQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => auditRepository.getRecent(8),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 2,
  });
}