export const productQueryKeys = {
  all: ["products"],
};

const PRODUCT_RELATED_QUERY_KEYS = [
  productQueryKeys.all,
  ["dashboard-summary"],
  ["reports-summary"],
  ["audit-logs"],
];

export async function invalidateProductRelatedQueries(queryClient) {
  await Promise.all(
    PRODUCT_RELATED_QUERY_KEYS.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    )
  );
}
