import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { dispatchLogQueryKeys } from "../../../productions/application/queryKeys";
import { listDispatchLogs } from "../../../productions/runtime/productions.runtime";

export function useReportsDispatchLogsQuery(filters = {}) {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: dispatchLogQueryKeys.list(filters),
    queryFn: () => listDispatchLogs(filters),
    enabled: !isAuthLoading && isAuthenticated,
    staleTime: 1000 * 30,
    placeholderData: (previousData) => previousData,
  });
}
