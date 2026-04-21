export const productionQueryKeys = {
  all: ["productions"],
  listRoot: ["productions", "list"],
  list: (filters = {}) => ["productions", "list", filters],
  dispatchPlanRoot: ["productions", "dispatch-plan"],
  dispatchPlan: (filters = {}) => ["productions", "dispatch-plan", filters],
};

export const dispatchLogQueryKeys = {
  all: ["dispatch-logs"],
  listRoot: ["dispatch-logs", "list"],
  list: (filters = {}) => ["dispatch-logs", "list", filters],
};

export async function refreshProductionQueries(queryClient) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: productionQueryKeys.all,
    }),
    queryClient.refetchQueries({
      queryKey: productionQueryKeys.dispatchPlanRoot,
    }),
    queryClient.refetchQueries({
      queryKey: productionQueryKeys.listRoot,
    }),
  ]);
}

export async function invalidateDispatchLogQueries(queryClient) {
  await queryClient.invalidateQueries({
    queryKey: dispatchLogQueryKeys.all,
  });
}
