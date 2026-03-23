import { useQuery } from "@tanstack/react-query";
import { auditRepository } from "../../../../shared/lib/audit/auditRepository";

export function useAuditLogsQuery() {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => auditRepository.getRecent(8),
  });
}