import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { productQueryKeys } from "../../application/queryKeys";
import { listProducts } from "../../runtime/products.runtime";

export function useProductsListQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: productQueryKeys.all,
    queryFn: () => listProducts(),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 2,
  });
}
