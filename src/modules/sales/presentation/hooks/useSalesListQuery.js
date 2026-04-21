import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { listSales } from "../../runtime/sales.runtime";

export function useSalesListQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["sales"],
    queryFn: listSales,
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 2,
  });
}