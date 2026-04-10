import { useAuth } from "../../../../app/providers/AppProviders";
import { useDispatchLogsQuery } from "../../../../modules/productions/presentation/hooks/useDispatchLogsQuery";

export function useReportsSummaryQuery(filters = {}) {
  const { isAuthLoading, isAuthenticated } = useAuth();

  const query = useDispatchLogsQuery(filters);

  return {
    ...query,
    isLoading: !isAuthLoading && isAuthenticated ? query.isLoading : false,
    isError: query.isError,
    error: query.error,
    data: query.data || [],
  };
}