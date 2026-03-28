import { ALL_PAGE_KEYS, PAGE_KEYS } from "../constants/permissions";

function normalizeRoleName(roleName) {
  return String(roleName || "").trim().toLowerCase();
}

export function isAdminProfile(profile) {
  return normalizeRoleName(profile?.roleName) === "admin";
}

export function getDefaultPagePermissionsByRoleName(roleName) {
  const normalizedRoleName = normalizeRoleName(roleName);

  if (normalizedRoleName === "admin") {
    return {
      [PAGE_KEYS.DASHBOARD]: true,
      [PAGE_KEYS.SALES]: true,
      [PAGE_KEYS.NEW_SALE]: true,
      [PAGE_KEYS.PRODUCTS]: true,
      [PAGE_KEYS.REPORTS]: true,
      [PAGE_KEYS.USERS]: true,
    };
  }

  if (normalizedRoleName === "manager") {
    return {
      [PAGE_KEYS.DASHBOARD]: true,
      [PAGE_KEYS.SALES]: true,
      [PAGE_KEYS.NEW_SALE]: true,
      [PAGE_KEYS.PRODUCTS]: true,
      [PAGE_KEYS.REPORTS]: true,
      [PAGE_KEYS.USERS]: false,
    };
  }

  if (normalizedRoleName === "sales") {
    return {
      [PAGE_KEYS.DASHBOARD]: true,
      [PAGE_KEYS.SALES]: true,
      [PAGE_KEYS.NEW_SALE]: true,
      [PAGE_KEYS.PRODUCTS]: false,
      [PAGE_KEYS.REPORTS]: false,
      [PAGE_KEYS.USERS]: false,
    };
  }

  return {
    [PAGE_KEYS.DASHBOARD]: true,
    [PAGE_KEYS.SALES]: false,
    [PAGE_KEYS.NEW_SALE]: false,
    [PAGE_KEYS.PRODUCTS]: false,
    [PAGE_KEYS.REPORTS]: false,
    [PAGE_KEYS.USERS]: false,
  };
}

export function normalizePagePermissions(input) {
  const raw =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};

  return ALL_PAGE_KEYS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      acc[key] = Boolean(raw[key]);
    } else {
      acc[key] = false;
    }
    return acc;
  }, {});
}

export function getSafePagePermissions(profile) {
  const raw = profile?.pagePermissions;

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return normalizePagePermissions(raw);
  }

  return getDefaultPagePermissionsByRoleName(profile?.roleName);
}

export function canAccessPage(profile, pageKey) {
  const permissions = getSafePagePermissions(profile);
  return Boolean(permissions[pageKey]);
}

export function getFirstAccessibleRoute(profile, routeMap) {
  const permissions = getSafePagePermissions(profile);

  const priority = [
    PAGE_KEYS.DASHBOARD,
    PAGE_KEYS.SALES,
    PAGE_KEYS.NEW_SALE,
    PAGE_KEYS.PRODUCTS,
    PAGE_KEYS.REPORTS,
    PAGE_KEYS.USERS,
  ];

  const found = priority.find((key) => permissions[key]);

  if (!found) {
    return routeMap.dashboard;
  }

  const reverseMap = {
    [PAGE_KEYS.DASHBOARD]: routeMap.dashboard,
    [PAGE_KEYS.SALES]: routeMap.sales,
    [PAGE_KEYS.NEW_SALE]: routeMap.newSale,
    [PAGE_KEYS.PRODUCTS]: routeMap.products,
    [PAGE_KEYS.REPORTS]: routeMap.reports,
    [PAGE_KEYS.USERS]: routeMap.users,
  };

  return reverseMap[found] ?? routeMap.dashboard;
}