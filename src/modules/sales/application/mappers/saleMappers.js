import { SALES_COLUMNS } from "../../../../shared/constants/database";

export function mapCreateSaleFormToInsert(
  values,
  selectedProduct,
  userId,
  organizationId = null
) {
  const quantity = Number(values.quantity ?? 0);
  const unitPrice = Number(selectedProduct?.unitPrice ?? 0);
  const vatRate = Number(selectedProduct?.vatRate ?? 0);
  const subtotal = quantity * unitPrice;
  const vatAmount =
    selectedProduct?.vatType === "HARIC" ? subtotal * (vatRate / 100) : 0;
  const totalAmount =
    selectedProduct?.vatType === "HARIC" ? subtotal + vatAmount : subtotal;

  return {
    [SALES_COLUMNS.SALE_DATE]: values.saleDate,
    [SALES_COLUMNS.CUSTOMER_NAME]: values.customerName,
    [SALES_COLUMNS.QUANTITY]: quantity,
    [SALES_COLUMNS.UNIT]: selectedProduct?.unit ?? "adet",
    [SALES_COLUMNS.UNIT_PRICE]: unitPrice,
    [SALES_COLUMNS.VAT_TYPE]: selectedProduct?.vatType ?? "HARIC",
    [SALES_COLUMNS.VAT_RATE]: vatRate,
    [SALES_COLUMNS.SUBTOTAL]: subtotal,
    [SALES_COLUMNS.VAT_AMOUNT]: vatAmount,
    [SALES_COLUMNS.TOTAL_AMOUNT]: totalAmount,
    [SALES_COLUMNS.STATUS]: values.status,
    [SALES_COLUMNS.NOTE]: values.note || null,
    [SALES_COLUMNS.CREATED_BY]: userId ?? null,
    [SALES_COLUMNS.UPDATED_BY]: userId ?? null,
    [SALES_COLUMNS.PRODUCT_ID]: Number(values.productId),
    organization_id: organizationId,
  };
}

export function mapUpdateSaleFormToPayload(values, existingSale, userId) {
  const quantity = Number(values.quantity ?? 0);
  const unitPrice = Number(existingSale?.unitPrice ?? 0);
  const vatRate = Number(existingSale?.vatRate ?? 0);
  const vatType = existingSale?.vatType ?? "HARIC";

  const subtotal = quantity * unitPrice;
  const vatAmount = vatType === "HARIC" ? subtotal * (vatRate / 100) : 0;
  const totalAmount = vatType === "HARIC" ? subtotal + vatAmount : subtotal;

  return {
    [SALES_COLUMNS.SALE_DATE]: values.saleDate,
    [SALES_COLUMNS.CUSTOMER_NAME]: values.customerName,
    [SALES_COLUMNS.QUANTITY]: quantity,
    [SALES_COLUMNS.SUBTOTAL]: subtotal,
    [SALES_COLUMNS.VAT_AMOUNT]: vatAmount,
    [SALES_COLUMNS.TOTAL_AMOUNT]: totalAmount,
    [SALES_COLUMNS.STATUS]: values.status,
    [SALES_COLUMNS.NOTE]: values.note || null,
    [SALES_COLUMNS.UPDATED_BY]: userId ?? null,
  };
}