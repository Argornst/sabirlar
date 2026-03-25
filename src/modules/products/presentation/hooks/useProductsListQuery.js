import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { getProductsList } from "../../application/use-cases/getProductsList";
import { productsRepository } from "../../infrastructure/repositories/productsRepository";

export function useProductsListQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["products"],
    queryFn: () => getProductsList({ productsRepository }),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
  });
}