import { SALES_COLUMNS } from "../../../../shared/constants/database";

export function normalizeSale(raw) {
  if (!raw) return null;

  return {
    id: raw[SALES_COLUMNS.ID] ?? "",
    saleDate: raw[SALES_COLUMNS.SALE_DATE] ?? null,
    customerName: raw[SALES_COLUMNS.CUSTOMER_NAME] ?? "-",
    quantity: Number(raw[SALES_COLUMNS.QUANTITY] ?? 0),
    unit: raw[SALES_COLUMNS.UNIT] ?? "-",
    unitPrice: Number(raw[SALES_COLUMNS.UNIT_PRICE] ?? 0),
    vatType: raw[SALES_COLUMNS.VAT_TYPE] ?? "HARIC",
    vatRate: Number(raw[SALES_COLUMNS.VAT_RATE] ?? 0),
    subtotal: Number(raw[SALES_COLUMNS.SUBTOTAL] ?? 0),
    vatAmount: Number(raw[SALES_COLUMNS.VAT_AMOUNT] ?? 0),
    totalAmount: Number(raw[SALES_COLUMNS.TOTAL_AMOUNT] ?? 0),
    status: raw[SALES_COLUMNS.STATUS] ?? "beklemede",
    note: raw[SALES_COLUMNS.NOTE] ?? "",
    createdBy: raw.created_by_user?.full_name ?? raw.created_by,
    updatedBy: raw.updated_by_user?.full_name ?? raw.updated_by,
    productId: raw[SALES_COLUMNS.PRODUCT_ID] ?? null,
    productName: raw?.products?.name ?? "-",
  };
}