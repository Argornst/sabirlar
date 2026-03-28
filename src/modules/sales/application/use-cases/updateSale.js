export async function updateSale({
  salesRepository,
  productsRepository,
  userId,
  sale,
  values,
}) {
  const {
    saleDate,
    customerName,
    paymentStatus,
    invoiceStatus,
    items,
    note,
  } = values;

  if (!sale?.id) {
    throw new Error("Güncellenecek sipariş bulunamadı.");
  }

  if (!items || !items.length) {
    throw new Error("En az bir ürün eklenmelidir.");
  }

  const productIds = items.map((item) => item.productId);
  const products = await productsRepository.getByIds(productIds);

  const computedItems = items.map((item) => {
    const product = products.find(
      (p) => String(p.id) === String(item.productId)
    );

    if (!product) {
      throw new Error("Ürün bulunamadı.");
    }

    const quantity = Number(item.quantity ?? 0);
    const unitPrice = Number(product.unitPrice ?? product.unit_price ?? 0);
    const vatRate = Number(product.vatRate ?? product.vat_rate ?? 0);
    const vatType = product.vatType ?? product.vat_type ?? "HARIC";
    const unit = product.unit ?? "adet";
    const productName = product.name ?? "Ürün";

    const subtotal = quantity * unitPrice;
    const vatAmount = vatType === "HARIC" ? subtotal * (vatRate / 100) : 0;
    const totalAmount = vatType === "HARIC" ? subtotal + vatAmount : subtotal;

    return {
      productId: product.id,
      productName,
      quantity,
      unit,
      unitPrice,
      vatType,
      vatRate,
      subtotal,
      vatAmount,
      totalAmount,
    };
  });

  const totals = computedItems.reduce(
    (acc, item) => {
      acc.subtotal += item.subtotal;
      acc.totalAmount += item.totalAmount;
      return acc;
    },
    { subtotal: 0, totalAmount: 0 }
  );

  const primaryItem = computedItems[0];

  await salesRepository.updateHeader({
    saleId: sale.id,
    saleDate,
    customerName,
    paymentStatus,
    invoiceStatus,
    subtotal: totals.subtotal,
    totalAmount: totals.totalAmount,
    note,
    updatedBy: userId,

    // legacy fallback columns
    productId: primaryItem.productId,
    quantity: primaryItem.quantity,
    unit: primaryItem.unit,
    unitPrice: primaryItem.unitPrice,
    vatType: primaryItem.vatType,
    vatRate: primaryItem.vatRate,
    vatAmount: primaryItem.vatAmount,
  });

  await salesRepository.replaceItems({
    saleId: sale.id,
    items: computedItems,
  });

  return {
    ...sale,
    saleDate,
    customerName,
    paymentStatus,
    invoiceStatus,
    subtotal: totals.subtotal,
    totalAmount: totals.totalAmount,
    note,
    updatedBy: userId,
    items: computedItems,
  };
}