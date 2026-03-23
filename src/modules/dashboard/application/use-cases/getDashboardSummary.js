function sumSalesRevenue(sales) {
  return sales.reduce((sum, sale) => sum + Number(sale.totalAmount ?? 0), 0);
}

function countSalesByStatus(sales, status) {
  return sales.filter((sale) => sale.status === status).length;
}

export async function getDashboardSummary({
  salesRepository,
  productsRepository,
  usersRepository,
}) {
  const [sales, products, users] = await Promise.all([
    salesRepository.getAll(),
    productsRepository.getAll(),
    usersRepository.getAll(),
  ]);

  return {
    totalSalesCount: sales.length,
    totalProductsCount: products.length,
    totalUsersCount: users.length,
    totalRevenue: sumSalesRevenue(sales),
    paidSalesCount: countSalesByStatus(sales, "paid"),
    pendingSalesCount: countSalesByStatus(sales, "pending"),
    recentSales: sales.slice(0, 5),
  };
}