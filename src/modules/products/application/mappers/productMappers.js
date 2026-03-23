import { PRODUCTS_COLUMNS } from "../../../../shared/constants/database";

export function mapCreateProductFormToInsert(values, organizationId = null) {
  return {
    [PRODUCTS_COLUMNS.NAME]: values.name,
    [PRODUCTS_COLUMNS.UNIT]: values.unit,
    [PRODUCTS_COLUMNS.UNIT_PRICE]: Number(values.unitPrice ?? 0),
    [PRODUCTS_COLUMNS.VAT_TYPE]: values.vatType,
    [PRODUCTS_COLUMNS.VAT_RATE]: Number(values.vatRate ?? 0),
    [PRODUCTS_COLUMNS.IS_ACTIVE]: true,
    organization_id: organizationId,
  };
}

export function mapUpdateProductFormToPayload(values) {
  return {
    [PRODUCTS_COLUMNS.NAME]: values.name,
    [PRODUCTS_COLUMNS.UNIT]: values.unit,
    [PRODUCTS_COLUMNS.UNIT_PRICE]: Number(values.unitPrice ?? 0),
    [PRODUCTS_COLUMNS.VAT_TYPE]: values.vatType,
    [PRODUCTS_COLUMNS.VAT_RATE]: Number(values.vatRate ?? 0),
  };
}