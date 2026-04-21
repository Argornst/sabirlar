import { useQuery } from "@tanstack/react-query";
import { productionQueryKeys } from "../../application/queryKeys";
import { listDispatchPlan } from "../../runtime/productions.runtime";

export const useDispatchPlanQuery = (filters = {}) => {
  return useQuery({
    queryKey: productionQueryKeys.dispatchPlan(filters),
    queryFn: () => listDispatchPlan(filters),
    refetchOnMount: "always",
  });
};
