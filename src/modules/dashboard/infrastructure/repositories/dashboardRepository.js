import { supabase } from "../../../../shared/lib/supabaseClient";

export const dashboardRepository = {
  async getSummary() {
    try {
      console.log("📊 dashboard summary (minimal)");

      // SADECE sales çek → diğerlerini geçici kaldır
      const { data: sales, error } = await supabase
        .from("sales")
        .select("*");

      if (error) {
        console.error("sales error:", error);
      }

      const safeSales = Array.isArray(sales) ? sales : [];

      const totalRevenue = safeSales.reduce(
        (sum, s) => sum + Number(s.total_amount || 0),
        0
      );

      return {
        totalRevenue,
        totalSalesCount: safeSales.length,
        pendingSalesCount: safeSales.filter(
          (s) => s.status === "beklemede"
        ).length,
        paidSalesCount: safeSales.filter(
          (s) => s.status === "odendi"
        ).length,

        // geçici sabit
        totalUsersCount: 0,
        totalProductsCount: 0,

        recentSales: safeSales.slice(0, 5),
      };
    } catch (err) {
      console.error("dashboard error:", err);

      return {
        totalRevenue: 0,
        totalSalesCount: 0,
        pendingSalesCount: 0,
        paidSalesCount: 0,
        totalUsersCount: 0,
        totalProductsCount: 0,
        recentSales: [],
      };
    }
  },
};