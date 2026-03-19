import { ROUTES } from "./routes";
import { ROLES } from "./roles";

export const DEFAULT_PAGE_PERMISSIONS = {
  dashboard: false,
  sales: false,
  new_sale: false,
  products: false,
  reports: false,
  users: false,
};

export const ROUTE_PERMISSION_MAP = {
  [ROUTES.DASHBOARD]: "dashboard",
  [ROUTES.SALES]: "sales",
  [ROUTES.NEW_SALE]: "new_sale",
  [ROUTES.PRODUCTS]: "products",
  [ROUTES.REPORTS]: "reports",
  [ROUTES.USERS]: "users",
};

export function normalizePagePermissions(input) {
  return {
    ...DEFAULT_PAGE_PERMISSIONS,
    ...(input || {}),
  };
}

export function isAdminProfile(profile) {
  return profile?.roles?.name === ROLES.ADMIN;
}

export function buildFullAccessPermissions() {
  return {
    dashboard: true,
    sales: true,
    new_sale: true,
    products: true,
    reports: true,
    users: true,
  };
}

export function buildDefaultStaffPermissions() {
  return {
    ...DEFAULT_PAGE_PERMISSIONS,
    dashboard: true,
    sales: true,
    new_sale: true,
    products: true,
    reports: true,
    users: false,
  };
}

export function canAccessRoute(profile, route) {
  if (!profile?.is_active) return false;
  if (isAdminProfile(profile)) return true;

  const permissionKey = ROUTE_PERMISSION_MAP[route];
  if (!permissionKey) return true;

  const permissions = normalizePagePermissions(profile?.page_permissions);
  return permissions[permissionKey] === true;
}