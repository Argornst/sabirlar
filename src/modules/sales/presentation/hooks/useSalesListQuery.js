import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { salesRepository } from "../../infrastructure/repositories/salesRepository";

export function useSalesListQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["sales"],
    queryFn: () => salesRepository.getAll(),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
  });
}