import { PRODUCTS_COLUMNS } from "../../../../shared/constants/database";

export function normalizeProduct(raw) {
  if (!raw) return null;

  return {
    id: raw[PRODUCTS_COLUMNS.ID] ?? "",
    name: raw[PRODUCTS_COLUMNS.NAME] ?? "-",
    unit: raw[PRODUCTS_COLUMNS.UNIT] ?? "-",
    unitPrice: Number(raw[PRODUCTS_COLUMNS.UNIT_PRICE] ?? 0),
    vatType: raw[PRODUCTS_COLUMNS.VAT_TYPE] ?? "HARIC",
    vatRate: Number(raw[PRODUCTS_COLUMNS.VAT_RATE] ?? 0),
    isActive: raw[PRODUCTS_COLUMNS.IS_ACTIVE] ?? true,
  };
}