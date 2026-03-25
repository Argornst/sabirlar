import { productsRepository } from "../../../products/infrastructure/repositories/productsRepository";
import { salesRepository } from "../../../sales/infrastructure/repositories/salesRepository";
import { usersRepository } from "../../../users/infrastructure/repositories/usersRepository";

function sumBy(list = [], selector) {
  return list.reduce((total, item) => total + Number(selector(item) ?? 0), 0);
}

export const dashboardRepository = {
  async getSummary() {
    const [salesResult, productsResult, usersResult] = await Promise.allSettled([
      salesRepository.getAll(),
      productsRepository.getAll(),
      usersRepository.getAll(),
    ]);

    const sales =
      salesResult.status === "fulfilled" && Array.isArray(salesResult.value)
        ? salesResult.value
        : [];

    const products =
      productsResult.status === "fulfilled" && Array.isArray(productsResult.value)
        ? productsResult.value
        : [];

    const users =
      usersResult.status === "fulfilled" && Array.isArray(usersResult.value)
        ? usersResult.value
        : [];

    const totalRevenue = sumBy(sales, (sale) => sale.totalAmount);
    const totalSalesCount = sales.length;
    const pendingSalesCount = sales.filter((sale) => sale.status === "beklemede").length;
    const paidSalesCount = sales.filter(
      (sale) => sale.status === "odendi" || sale.status === "odendi_faturalandi"
    ).length;

    const recentSales = [...sales]
      .sort((a, b) => {
        const left = new Date(b.createdAt || b.saleDate || 0).getTime();
        const right = new Date(a.createdAt || a.saleDate || 0).getTime();
        return left - right;
      })
      .slice(0, 5);

    return {
      totalRevenue,
      totalSalesCount,
      pendingSalesCount,
      paidSalesCount,
      totalUsersCount: users.length,
      totalProductsCount: products.length,
      recentSales,
    };
  },
};