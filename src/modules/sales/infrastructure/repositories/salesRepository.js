import { supabase } from "../../../../shared/lib/supabaseClient";
import {
  DB_TABLES,
  SALES_COLUMNS,
  SALE_ITEMS_COLUMNS,
} from "../../../../shared/constants/database";

const SALES_SELECT = `
  *,
  products ( name ),
  created_by_user:users!sales_created_by_fkey ( full_name ),
  updated_by_user:users!sales_updated_by_fkey ( full_name ),
  sale_items (
    id,
    product_id,
    product_name_snapshot,
    quantity,
    unit,
    unit_price,
    vat_type,
    vat_rate,
    subtotal,
    vat_amount,
    total_amount
  )
`;

function normalizeSaleRecord(raw) {
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

  const fallbackItems =
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

  const normalizedItems = items.length ? items : fallbackItems;

  return {
    id: raw.id,
    saleDate: raw.sale_date,
    customerName: raw.customer_name,
    paymentStatus: raw.payment_status ?? "beklemede",
    invoiceStatus: raw.invoice_status ?? "faturalanmadi",
    status: raw.status ?? "beklemede",
    subtotal: Number(raw.subtotal ?? 0),
    totalAmount: Number(raw.total_amount ?? 0),
    note: raw.note ?? "",
    createdBy: raw.created_by_user?.full_name ?? raw.created_by ?? "-",
    updatedBy: raw.updated_by_user?.full_name ?? raw.updated_by ?? "-",
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
    itemCount: normalizedItems.length,
    items: normalizedItems,
  };
}

function buildLegacyStatus(paymentStatus, invoiceStatus) {
  if (paymentStatus === "odendi" && invoiceStatus === "faturalandi") {
    return "odendi_faturalandi";
  }
  if (paymentStatus === "odendi") {
    return "odendi";
  }
  if (invoiceStatus === "faturalandi") {
    return "faturalandi";
  }
  return "beklemede";
}

function parseLegacyStatus(status) {
  if (status === "odendi_faturalandi") {
    return {
      paymentStatus: "odendi",
      invoiceStatus: "faturalandi",
    };
  }

  if (status === "odendi") {
    return {
      paymentStatus: "odendi",
      invoiceStatus: "faturalanmadi",
    };
  }

  if (status === "faturalandi") {
    return {
      paymentStatus: "beklemede",
      invoiceStatus: "faturalandi",
    };
  }

  return {
    paymentStatus: "beklemede",
    invoiceStatus: "faturalanmadi",
  };
}

function mapCreateSaleHeaderToInsert({
  saleDate,
  customerName,
  paymentStatus,
  invoiceStatus,
  subtotal,
  totalAmount,
  note,
  createdBy,
  organizationId,
  productId,
  quantity,
  unit,
  unitPrice,
  vatType,
  vatRate,
  vatAmount,
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

    // legacy required columns
    [SALES_COLUMNS.PRODUCT_ID]: productId,
    [SALES_COLUMNS.QUANTITY]: quantity,
    [SALES_COLUMNS.UNIT]: unit,
    [SALES_COLUMNS.UNIT_PRICE]: unitPrice,
    [SALES_COLUMNS.VAT_TYPE]: vatType,
    [SALES_COLUMNS.VAT_RATE]: vatRate,
    [SALES_COLUMNS.VAT_AMOUNT]: vatAmount,

    [SALES_COLUMNS.STATUS]: buildLegacyStatus(paymentStatus, invoiceStatus),
  };
}

function mapSaleItemsToInsert({ saleId, items }) {
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

async function create({
  saleDate,
  customerName,
  paymentStatus,
  invoiceStatus,
  subtotal,
  totalAmount,
  note,
  createdBy,
  organizationId,
  productId,
  quantity,
  unit,
  unitPrice,
  vatType,
  vatRate,
  vatAmount,
}) {
  const payload = mapCreateSaleHeaderToInsert({
    saleDate,
    customerName,
    paymentStatus,
    invoiceStatus,
    subtotal,
    totalAmount,
    note,
    createdBy,
    organizationId,
    productId,
    quantity,
    unit,
    unitPrice,
    vatType,
    vatRate,
    vatAmount,
  });

  const { data, error } = await supabase
  .from(DB_TABLES.SALES)
  .update(payload)
  .eq(SALES_COLUMNS.ID, saleId)
  .select("*")   // 🔥 önemli
  .single();     // 🔥 önemli

if (error) {
  throw new Error(error.message);
}

return normalizeSaleRecord(data);
}

async function insertItems({ saleId, items }) {
  const payload = mapSaleItemsToInsert({ saleId, items });

  const { error } = await supabase.from(DB_TABLES.SALE_ITEMS).insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}

async function getAll() {
  const { data, error } = await supabase
    .from(DB_TABLES.SALES)
    .select(SALES_SELECT)
    .order(SALES_COLUMNS.ID, { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data) ? data.map(normalizeSaleRecord) : [];
}

async function updateHeader({
  saleId,
  saleDate,
  customerName,
  paymentStatus,
  invoiceStatus,
  subtotal,
  totalAmount,
  note,
  updatedBy,
  productId,
  quantity,
  unit,
  unitPrice,
  vatType,
  vatRate,
  vatAmount,
}) {
  const payload = {
    [SALES_COLUMNS.SALE_DATE]: saleDate,
    [SALES_COLUMNS.CUSTOMER_NAME]: customerName,
    [SALES_COLUMNS.PAYMENT_STATUS]: paymentStatus,
    [SALES_COLUMNS.INVOICE_STATUS]: invoiceStatus,
    [SALES_COLUMNS.SUBTOTAL]: subtotal,
    [SALES_COLUMNS.TOTAL_AMOUNT]: totalAmount,
    [SALES_COLUMNS.NOTE]: note ?? "",
    [SALES_COLUMNS.UPDATED_BY]: updatedBy ?? null,

    // legacy required columns
    [SALES_COLUMNS.PRODUCT_ID]: productId,
    [SALES_COLUMNS.QUANTITY]: quantity,
    [SALES_COLUMNS.UNIT]: unit,
    [SALES_COLUMNS.UNIT_PRICE]: unitPrice,
    [SALES_COLUMNS.VAT_TYPE]: vatType,
    [SALES_COLUMNS.VAT_RATE]: vatRate,
    [SALES_COLUMNS.VAT_AMOUNT]: vatAmount,

    [SALES_COLUMNS.STATUS]: buildLegacyStatus(paymentStatus, invoiceStatus),
  };

  const { error } = await supabase
    .from(DB_TABLES.SALES)
    .update(payload)
    .eq(SALES_COLUMNS.ID, saleId);

  if (error) {
    throw new Error(error.message);
  }
}

async function updateStatus(saleId, nextStatus, updatedBy) {
  if (saleId == null || saleId === "") {
    throw new Error("Güncellenecek sipariş ID bilgisi bulunamadı.");
  }

  const { paymentStatus, invoiceStatus } = parseLegacyStatus(nextStatus);

  const payload = {
    [SALES_COLUMNS.PAYMENT_STATUS]: paymentStatus,
    [SALES_COLUMNS.INVOICE_STATUS]: invoiceStatus,
    [SALES_COLUMNS.STATUS]: nextStatus,
    [SALES_COLUMNS.UPDATED_BY]: updatedBy ?? null,
  };

  const { error } = await supabase
    .from(DB_TABLES.SALES)
    .update(payload)
    .eq(SALES_COLUMNS.ID, saleId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: saleId,
    status: nextStatus,
    paymentStatus,
    invoiceStatus,
  };
}

async function deleteItemsBySaleId(saleId) {
  const { error } = await supabase
    .from(DB_TABLES.SALE_ITEMS)
    .delete()
    .eq(SALE_ITEMS_COLUMNS.SALE_ID, saleId);

  if (error) {
    throw new Error(error.message);
  }
}

async function replaceItems({ saleId, items }) {
  await deleteItemsBySaleId(saleId);

  const payload = mapSaleItemsToInsert({ saleId, items });

  const { error } = await supabase.from(DB_TABLES.SALE_ITEMS).insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}

async function remove(saleId) {
  if (saleId == null || saleId === "") {
    throw new Error("Silinecek sipariş ID bilgisi bulunamadı.");
  }

  const { error } = await supabase
    .from(DB_TABLES.SALES)
    .delete()
    .eq(SALES_COLUMNS.ID, saleId);

  if (error) {
    throw new Error(error.message);
  }
}

export const salesRepository = {
  create,
  insertItems,
  getAll,
  updateHeader,
  updateStatus,
  replaceItems,
  remove,
};