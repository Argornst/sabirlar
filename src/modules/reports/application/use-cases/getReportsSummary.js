function sumRevenue(sales) {
  return sales.reduce((sum, sale) => sum + Number(sale.totalAmount ?? 0), 0);
}

function sumStock(products) {
  return products.reduce((sum, product) => sum + Number(product.stock ?? 0), 0);
}

function countActiveUsers(users) {
  return users.filter((user) => user.isActive).length;
}

function buildSalesByStatus(sales) {
  return sales.reduce((acc, sale) => {
    const key = sale.status ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

export async function getReportsSummary({
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
    totalRevenue: sumRevenue(sales),
    totalStock: sumStock(products),
    activeUsers: countActiveUsers(users),
    salesByStatus: buildSalesByStatus(sales),
    totalSales: sales.length,
    totalProducts: products.length,
    totalUsers: users.length,
  };
}