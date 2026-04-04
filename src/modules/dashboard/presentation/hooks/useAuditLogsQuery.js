import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { auditRepository } from "../../../../shared/lib/audit/auditRepository";

export function useAuditLogsQuery(options = {}) {
  const { isAuthLoading, isAuthenticated } = useAuth();
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => auditRepository.getRecent(8),
    enabled: enabled && !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
  });
}