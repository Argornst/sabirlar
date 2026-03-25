import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { supabase } from "../../../../shared/lib/supabaseClient";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

async function getFastReportsSummary() {
  const [
    salesCountResult,
    revenueResult,
    productsCountResult,
    usersCountResult,
  ] = await Promise.allSettled([
    supabase.from("sales").select("id", { count: "exact", head: true }),
    supabase.from("sales").select("total_amount"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }),
  ]);

  const totalSales =
    salesCountResult.status === "fulfilled" && !salesCountResult.value.error
      ? Number(salesCountResult.value.count ?? 0)
      : 0;

  const totalRevenue =
    revenueResult.status === "fulfilled" && !revenueResult.value.error
      ? safeArray(revenueResult.value.data).reduce(
          (sum, item) => sum + Number(item.total_amount ?? 0),
          0
        )
      : 0;

  const totalProducts =
    productsCountResult.status === "fulfilled" && !productsCountResult.value.error
      ? Number(productsCountResult.value.count ?? 0)
      : 0;

  const totalUsers =
    usersCountResult.status === "fulfilled" && !usersCountResult.value.error
      ? Number(usersCountResult.value.count ?? 0)
      : 0;

  return {
    totalSales,
    totalRevenue,
    totalProducts,
    totalUsers,
  };
}

export function useReportsSummaryQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["reports-summary"],
    queryFn: getFastReportsSummary,
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
    staleTime: 1000 * 60 * 3,
  });
}