import { formatCurrency } from "../../../../shared/utils/currency";

export function mapSalesToExport(sales = []) {
  return sales.map((sale) => ({
    id: sale.id,
    customer: sale.customerName,
    product: sale.productName,
    quantity: sale.quantity,
    unit: sale.unit,
    total: formatCurrency(sale.totalAmount, "TRY"),
    status: sale.status,
  }));
}

export const salesExportColumns = [
  { header: "ID", key: "id" },
  { header: "Müşteri", key: "customer" },
  { header: "Ürün", key: "product" },
  { header: "Adet", key: "quantity" },
  { header: "Birim", key: "unit" },
  { header: "Toplam", key: "total" },
  { header: "Durum", key: "status" },
];