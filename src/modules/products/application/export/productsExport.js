import { formatCurrency } from "../../../../shared/utils/currency";

export function mapProductsToExport(products = []) {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    price: formatCurrency(p.unitPrice, "TRY"),
    vat: `${p.vatType} %${p.vatRate}`,
    status: p.isActive ? "active" : "inactive",
  }));
}

export const productsExportColumns = [
  { header: "ID", key: "id" },
  { header: "Ürün", key: "name" },
  { header: "Birim", key: "unit" },
  { header: "Fiyat", key: "price" },
  { header: "KDV", key: "vat" },
  { header: "Durum", key: "status" },
];