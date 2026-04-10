import { useQuery } from "@tanstack/react-query";
import { fetchDispatchLogs } from "../../infrastructure/repositories/dispatchLogRepository";

export const dispatchLogKeys = {
  all: ["dispatch-logs"],
  list: (filters = {}) => ["dispatch-logs", "list", filters],
};

export function useDispatchLogsQuery(filters = {}) {
  return useQuery({
    queryKey: dispatchLogKeys.list(filters),
    queryFn: () => fetchDispatchLogs(filters),
    staleTime: 1000 * 30,
    keepPreviousData: true,
  });
}