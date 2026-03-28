export function createSaleEntity(raw) {
  const items = Array.isArray(raw?.sale_items)
    ? raw.sale_items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name_snapshot || "Ürün",
        quantity: Number(item.quantity ?? 0),
        unit: item.unit ?? "adet",
        unitPrice: Number(item.unit_price ?? 0),
        vatType: item.vat_type ?? "HARIC",
        vatRate: Number(item.vat_rate ?? 0),
        subtotal: Number(item.subtotal ?? 0),
        vatAmount: Number(item.vat_amount ?? 0),
        totalAmount: Number(item.total_amount ?? 0),
      }))
    : [];

  const fallbackItem =
    !items.length && raw?.product_id
      ? [
          {
            id: `legacy-${raw.id}`,
            productId: raw.product_id,
            productName: raw.products?.name ?? "Ürün",
            quantity: Number(raw.quantity ?? 0),
            unit: raw.unit ?? "adet",
            unitPrice: Number(raw.unit_price ?? 0),
            vatType: raw.vat_type ?? "HARIC",
            vatRate: Number(raw.vat_rate ?? 0),
            subtotal: Number(raw.subtotal ?? 0),
            vatAmount: Number(raw.vat_amount ?? 0),
            totalAmount: Number(raw.total_amount ?? 0),
          },
        ]
      : [];

  const normalizedItems = items.length ? items : fallbackItem;

  return {
    id: raw?.id ?? null,
    saleDate: raw?.sale_date ?? null,
    customerName: raw?.customer_name ?? "",
    paymentStatus: raw?.payment_status ?? "beklemede",
    invoiceStatus: raw?.invoice_status ?? "faturalanmadi",
    subtotal: Number(raw?.subtotal ?? 0),
    totalAmount: Number(raw?.total_amount ?? 0),
    note: raw?.note ?? "",
    createdBy: raw?.created_by_user?.full_name ?? raw?.created_by ?? "-",
    updatedBy: raw?.updated_by_user?.full_name ?? raw?.updated_by ?? "-",
    createdAt: raw?.created_at ?? null,
    updatedAt: raw?.updated_at ?? null,
    itemCount: normalizedItems.length,
    items: normalizedItems,
  };
}