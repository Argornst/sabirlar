export const PAGE_KEYS = {
  DASHBOARD: "dashboard",
  SALES: "sales",
  NEW_SALE: "newSale",
  PRODUCTS: "products",
  REPORTS: "reports",
  USERS: "users",
};

export const ALL_PAGE_KEYS = Object.values(PAGE_KEYS);

export const PAGE_PERMISSION_LABELS = {
  [PAGE_KEYS.DASHBOARD]: "Dashboard",
  [PAGE_KEYS.SALES]: "Sales",
  [PAGE_KEYS.NEW_SALE]: "New Sale",
  [PAGE_KEYS.PRODUCTS]: "Products",
  [PAGE_KEYS.REPORTS]: "Reports",
  [PAGE_KEYS.USERS]: "Users",
};

export const PAGE_PERMISSION_DESCRIPTIONS = {
  [PAGE_KEYS.DASHBOARD]: "Dashboard ekranını görüntüleme izni",
  [PAGE_KEYS.SALES]: "Satış listesini görüntüleme izni",
  [PAGE_KEYS.NEW_SALE]: "Yeni satış oluşturma ekranına erişim izni",
  [PAGE_KEYS.PRODUCTS]: "Ürün yönetimi ekranını görüntüleme izni",
  [PAGE_KEYS.REPORTS]: "Rapor ekranını görüntüleme izni",
  [PAGE_KEYS.USERS]: "Kullanıcı yönetimi ekranını görüntüleme izni",
};

export const PAGE_PERMISSION_BY_ROUTE_KEY = {
  dashboard: PAGE_KEYS.DASHBOARD,
  sales: PAGE_KEYS.SALES,
  newSale: PAGE_KEYS.NEW_SALE,
  products: PAGE_KEYS.PRODUCTS,
  reports: PAGE_KEYS.REPORTS,
  users: PAGE_KEYS.USERS,
};

export const DEFAULT_PAGE_PERMISSIONS = {
  [PAGE_KEYS.DASHBOARD]: true,
  [PAGE_KEYS.SALES]: true,
  [PAGE_KEYS.NEW_SALE]: true,
  [PAGE_KEYS.PRODUCTS]: true,
  [PAGE_KEYS.REPORTS]: true,
  [PAGE_KEYS.USERS]: true,
};

export function getDefaultPagePermissions() {
  return { ...DEFAULT_PAGE_PERMISSIONS };
}