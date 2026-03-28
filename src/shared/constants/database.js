export const DB_TABLES = {
  SALES: "sales",
  SALE_ITEMS: "sale_items",
  PRODUCTS: "products",
  USERS: "users",
  ROLES: "roles",
  ORGANIZATIONS: "organizations",
  ORGANIZATION_MEMBERSHIPS: "organization_memberships",
  AUDIT_LOGS: "audit_logs",
};

export const SALES_COLUMNS = {
  ID: "id",
  SALE_DATE: "sale_date",
  CUSTOMER_NAME: "customer_name",

  // legacy single-item columns
  PRODUCT_ID: "product_id",
  QUANTITY: "quantity",
  UNIT: "unit",
  UNIT_PRICE: "unit_price",
  VAT_TYPE: "vat_type",
  VAT_RATE: "vat_rate",
  VAT_AMOUNT: "vat_amount",

  // totals
  SUBTOTAL: "subtotal",
  TOTAL_AMOUNT: "total_amount",

  // legacy combined status
  STATUS: "status",

  // new independent statuses
  PAYMENT_STATUS: "payment_status",
  INVOICE_STATUS: "invoice_status",

  NOTE: "note",
  CREATED_BY: "created_by",
  UPDATED_BY: "updated_by",
  ORGANIZATION_ID: "organization_id",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

export const SALE_ITEMS_COLUMNS = {
  ID: "id",
  SALE_ID: "sale_id",
  PRODUCT_ID: "product_id",
  PRODUCT_NAME_SNAPSHOT: "product_name_snapshot",
  QUANTITY: "quantity",
  UNIT: "unit",
  UNIT_PRICE: "unit_price",
  VAT_TYPE: "vat_type",
  VAT_RATE: "vat_rate",
  SUBTOTAL: "subtotal",
  VAT_AMOUNT: "vat_amount",
  TOTAL_AMOUNT: "total_amount",
  CREATED_AT: "created_at",
};

export const PRODUCTS_COLUMNS = {
  ID: "id",
  NAME: "name",
  UNIT: "unit",
  UNIT_PRICE: "unit_price",
  VAT_TYPE: "vat_type",
  VAT_RATE: "vat_rate",
  IS_ACTIVE: "is_active",
  ORGANIZATION_ID: "organization_id",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

export const USERS_COLUMNS = {
  ID: "id",
  USERNAME: "username",
  FULL_NAME: "full_name",
  EMAIL: "email",
  IS_ACTIVE: "is_active",
  ROLE_ID: "role_id",
  PAGE_PERMISSIONS: "page_permissions",
  ORGANIZATION_ID: "organization_id",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

export const ORGANIZATIONS_COLUMNS = {
  ID: "id",
  NAME: "name",
  SLUG: "slug",
  IS_ACTIVE: "is_active",
  CREATED_AT: "created_at",
};

export const ORGANIZATION_MEMBERSHIPS_COLUMNS = {
  ID: "id",
  ORGANIZATION_ID: "organization_id",
  USER_ID: "user_id",
  ROLE_ID: "role_id",
  IS_ACTIVE: "is_active",
  CREATED_AT: "created_at",
};

export const AUDIT_LOG_COLUMNS = {
  ID: "id",
  ACTION: "action",
  ENTITY_TYPE: "entity_type",
  ENTITY_ID: "entity_id",
  ACTOR_USER_ID: "actor_user_id",
  ACTOR_EMAIL: "actor_email",
  METADATA: "metadata",
  CREATED_AT: "created_at",
};

export const EDGE_FUNCTIONS = {
  CREATE_USER: "create-user",
  RESOLVE_LOGIN: "resolve-login",
};