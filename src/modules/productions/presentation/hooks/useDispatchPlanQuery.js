import { useQuery } from "@tanstack/react-query";
import { getDispatchPlan } from "../../application/use-cases/getDispatchPlan";
import { productionQueryKeys } from "./useProductionsListQuery";

export const useDispatchPlanQuery = (filters = {}) => {
  return useQuery({
    queryKey: productionQueryKeys.dispatchPlan(filters),
    queryFn: () => getDispatchPlan(filters),
    refetchOnMount: "always",
  });
};