import { useReportsDispatchLogsQuery } from "./useReportsDispatchLogsQuery";

export function useReportsSummaryQuery(filters = {}) {
  return useReportsDispatchLogsQuery(filters);
}
