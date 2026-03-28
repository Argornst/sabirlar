import { createSaleEntity } from "../../domain/entities/sale.entity";
import {
  SALES_COLUMNS,
  SALE_ITEMS_COLUMNS,
} from "../../../../shared/constants/database";

export function mapSaleRecordToEntity(raw) {
  return createSaleEntity(raw);
}

export function mapSalesRecordsToEntities(records) {
  return Array.isArray(records) ? records.map(mapSaleRecordToEntity) : [];
}

export function mapCreateSaleHeaderToInsert({
  saleDate,
  customerName,
  paymentStatus,
  invoiceStatus,
  subtotal,
  totalAmount,
  note,
  createdBy,
  organizationId,
}) {
  return {
    [SALES_COLUMNS.SALE_DATE]: saleDate,
    [SALES_COLUMNS.CUSTOMER_NAME]: customerName,
    [SALES_COLUMNS.PAYMENT_STATUS]: paymentStatus,
    [SALES_COLUMNS.INVOICE_STATUS]: invoiceStatus,
    [SALES_COLUMNS.SUBTOTAL]: subtotal,
    [SALES_COLUMNS.TOTAL_AMOUNT]: totalAmount,
    [SALES_COLUMNS.NOTE]: note || null,
    [SALES_COLUMNS.CREATED_BY]: createdBy ?? null,
    [SALES_COLUMNS.UPDATED_BY]: createdBy ?? null,
    [SALES_COLUMNS.ORGANIZATION_ID]: organizationId ?? null,

    // legacy compatibility
    [SALES_COLUMNS.STATUS]:
      paymentStatus === "odendi" && invoiceStatus === "faturalandi"
        ? "odendi_faturalandi"
        : paymentStatus === "odendi"
          ? "odendi"
          : invoiceStatus === "faturalandi"
            ? "faturalandi"
            : "beklemede",
  };
}

export function mapSaleItemsToInsert({ saleId, items }) {
  return items.map((item) => ({
    [SALE_ITEMS_COLUMNS.SALE_ID]: saleId,
    [SALE_ITEMS_COLUMNS.PRODUCT_ID]: item.productId,
    [SALE_ITEMS_COLUMNS.PRODUCT_NAME_SNAPSHOT]: item.productName,
    [SALE_ITEMS_COLUMNS.QUANTITY]: item.quantity,
    [SALE_ITEMS_COLUMNS.UNIT]: item.unit,
    [SALE_ITEMS_COLUMNS.UNIT_PRICE]: item.unitPrice,
    [SALE_ITEMS_COLUMNS.VAT_TYPE]: item.vatType,
    [SALE_ITEMS_COLUMNS.VAT_RATE]: item.vatRate,
    [SALE_ITEMS_COLUMNS.SUBTOTAL]: item.subtotal,
    [SALE_ITEMS_COLUMNS.VAT_AMOUNT]: item.vatAmount,
    [SALE_ITEMS_COLUMNS.TOTAL_AMOUNT]: item.totalAmount,
  }));
}