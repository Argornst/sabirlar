import { supabase } from "../../../../shared/lib/supabaseClient";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export const dashboardRepository = {
  async getSummary() {
    const [
      salesCountResult,
      paidSalesResult,
      pendingSalesResult,
      revenueResult,
      productsCountResult,
      usersCountResult,
      recentSalesResult,
    ] = await Promise.allSettled([
      supabase.from("sales").select("id", { count: "exact", head: true }),
      supabase
        .from("sales")
        .select("id", { count: "exact", head: true })
        .in("status", ["odendi", "odendi_faturalandi"]),
      supabase
        .from("sales")
        .select("id", { count: "exact", head: true })
        .eq("status", "beklemede"),
      supabase.from("sales").select("total_amount"),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase
        .from("sales")
        .select(
          "id, customer_name, total_amount, status, payment_status, invoice_status, sale_date, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const totalRevenue =
      revenueResult.status === "fulfilled" && !revenueResult.value.error
        ? safeArray(revenueResult.value.data).reduce(
            (sum, item) => sum + Number(item.total_amount ?? 0),
            0
          )
        : 0;

    const totalSalesCount =
      salesCountResult.status === "fulfilled" && !salesCountResult.value.error
        ? Number(salesCountResult.value.count ?? 0)
        : 0;

    const paidSalesCount =
      paidSalesResult.status === "fulfilled" && !paidSalesResult.value.error
        ? Number(paidSalesResult.value.count ?? 0)
        : 0;

    const pendingSalesCount =
      pendingSalesResult.status === "fulfilled" && !pendingSalesResult.value.error
        ? Number(pendingSalesResult.value.count ?? 0)
        : 0;

    const totalProductsCount =
      productsCountResult.status === "fulfilled" && !productsCountResult.value.error
        ? Number(productsCountResult.value.count ?? 0)
        : 0;

    const totalUsersCount =
      usersCountResult.status === "fulfilled" && !usersCountResult.value.error
        ? Number(usersCountResult.value.count ?? 0)
        : 0;

    const recentSales =
      recentSalesResult.status === "fulfilled" && !recentSalesResult.value.error
        ? safeArray(recentSalesResult.value.data).map((item) => ({
            id: item.id,
            customerName: item.customer_name ?? "",
            totalAmount: Number(item.total_amount ?? 0),
            status: item.status ?? "",
            paymentStatus: item.payment_status ?? "beklemede",
            invoiceStatus: item.invoice_status ?? "faturalanmadi",
            saleDate: item.sale_date ?? null,
            createdAt: item.created_at ?? null,
          }))
        : [];

    return {
      totalRevenue,
      totalSalesCount,
      pendingSalesCount,
      paidSalesCount,
      totalUsersCount,
      totalProductsCount,
      recentSales,
    };
  },
};