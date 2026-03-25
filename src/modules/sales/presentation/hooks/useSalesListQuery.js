import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { getSalesList } from "../../application/use-cases/getSalesList";
import { salesRepository } from "../../infrastructure/repositories/salesRepository";

export function useSalesListQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["sales"],
    queryFn: () => getSalesList({ salesRepository }),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 2,
  });
}