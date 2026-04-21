export const SALES_RELATED_QUERY_KEYS = [
  ["sales"],
  ["dashboard-summary"],
  ["reports-summary"],
  ["audit-logs"],
];

export async function invalidateSalesRelatedQueries(queryClient) {
  await Promise.all(
    SALES_RELATED_QUERY_KEYS.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    )
  );
}
