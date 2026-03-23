import { useQuery } from "@tanstack/react-query";
import { getSalesList } from "../../application/use-cases/getSalesList";
import { salesRepository } from "../../infrastructure/repositories/salesRepository";

export function useSalesListQuery() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: () => getSalesList({ salesRepository }),
  });
}