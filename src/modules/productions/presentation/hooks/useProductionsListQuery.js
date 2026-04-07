import { useQuery } from "@tanstack/react-query";
import { getProductionsList } from "../../application/use-cases/getProductionsList";

export const productionQueryKeys = {
  all: ["productions"],
  list: (filters) => ["productions", "list", filters],
  dispatchPlan: (filters) => ["productions", "dispatch-plan", filters],
};

export const useProductionsListQuery = (filters) => {
  return useQuery({
    queryKey: productionQueryKeys.list(filters),
    queryFn: () => getProductionsList(filters),
    refetchOnMount: "always",
  });
};