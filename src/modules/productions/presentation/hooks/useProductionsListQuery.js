import { useQuery } from "@tanstack/react-query";
import { productionQueryKeys } from "../../application/queryKeys";
import { listProductions } from "../../runtime/productions.runtime";

export { productionQueryKeys };

export const useProductionsListQuery = (filters = {}) => {
  return useQuery({
    queryKey: productionQueryKeys.list(filters),
    queryFn: () => listProductions(filters),
    refetchOnMount: "always",
  });
};
