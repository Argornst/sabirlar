export const AUDIT_ENTITY_TYPES = {
  SALE: "sale",
  PRODUCT: "product",
  USER: "user",
  AUTH: "auth",
  ORGANIZATION: "organization",
};

export const AUDIT_ACTIONS = {
  SALE_CREATED: "sale_created",
  SALE_UPDATED: "sale_updated",
  SALE_DELETED: "sale_deleted",
  SALE_STATUS_UPDATED: "sale_status_updated",

  PRODUCT_CREATED: "product_created",
  PRODUCT_UPDATED: "product_updated",
  PRODUCT_DELETED: "product_deleted",
  PRODUCT_STATUS_UPDATED: "product_status_updated",

  USER_CREATED: "user_created",
  USER_UPDATED: "user_updated",
  USER_ROLE_UPDATED: "user_role_updated",
  USER_PERMISSIONS_UPDATED: "user_permissions_updated",
  USER_STATUS_UPDATED: "user_status_updated",

  ORGANIZATION_CREATED: "organization_created",
  ORGANIZATION_UPDATED: "organization_updated",

  LOGIN_SUCCESS: "login_success",
  LOGOUT: "logout",
};