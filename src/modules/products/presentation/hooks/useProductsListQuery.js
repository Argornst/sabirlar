import { useQuery } from "@tanstack/react-query";
import { getProductsList } from "../../application/use-cases/getProductsList";
import { productsRepository } from "../../infrastructure/repositories/productsRepository";

export function useProductsListQuery() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => getProductsList({ productsRepository }),
  });
}