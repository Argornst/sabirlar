export const PAGE_KEYS = {
  DASHBOARD: "dashboard",
  SALES: "sales",
  NEW_SALE: "new_sale",
  PRODUCTS: "products",
  REPORTS: "reports",
  USERS: "users",
};

export const PAGE_PERMISSION_BY_ROUTE_KEY = {
  dashboard: PAGE_KEYS.DASHBOARD,
  sales: PAGE_KEYS.SALES,
  newSale: PAGE_KEYS.NEW_SALE,
  products: PAGE_KEYS.PRODUCTS,
  reports: PAGE_KEYS.REPORTS,
  users: PAGE_KEYS.USERS,
};

export const PAGE_PERMISSION_LABELS = {
  [PAGE_KEYS.DASHBOARD]: "Dashboard",
  [PAGE_KEYS.SALES]: "Sales",
  [PAGE_KEYS.NEW_SALE]: "New Sale",
  [PAGE_KEYS.PRODUCTS]: "Products",
  [PAGE_KEYS.REPORTS]: "Reports",
  [PAGE_KEYS.USERS]: "Users",
};

export const ALL_PAGE_KEYS = Object.values(PAGE_KEYS);