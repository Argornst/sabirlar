import { useQuery } from "@tanstack/react-query";
import { dispatchLogQueryKeys } from "../../application/queryKeys";
import { listDispatchLogs } from "../../runtime/productions.runtime";

export const dispatchLogKeys = dispatchLogQueryKeys;

export function useDispatchLogsQuery(filters = {}) {
  return useQuery({
    queryKey: dispatchLogQueryKeys.list(filters),
    queryFn: () => listDispatchLogs(filters),
    staleTime: 1000 * 30,
    placeholderData: (previousData) => previousData,
  });
}
