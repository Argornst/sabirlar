import { USERS_COLUMNS } from "../../../../shared/constants/database";

export function normalizeUser(raw) {
  if (!raw) return null;

  return {
    id: raw[USERS_COLUMNS.ID] ?? "",
    username: raw[USERS_COLUMNS.USERNAME] ?? "-",
    fullName: raw[USERS_COLUMNS.FULL_NAME] ?? "-",
    email: raw[USERS_COLUMNS.EMAIL] ?? "-",
    isActive: Boolean(raw[USERS_COLUMNS.IS_ACTIVE] ?? true),
    roleId: raw[USERS_COLUMNS.ROLE_ID] ?? null,
    pagePermissions: raw[USERS_COLUMNS.PAGE_PERMISSIONS] ?? {},
    organizationId: raw[USERS_COLUMNS.ORGANIZATION_ID] ?? null,
    createdAt: raw[USERS_COLUMNS.CREATED_AT] ?? null,
    updatedAt: raw[USERS_COLUMNS.UPDATED_AT] ?? null,
    roleName: raw?.role_name ?? "-",
    organizationName: raw?.organization_name ?? "-",
    organizationSlug: raw?.organization_slug ?? null,
  };
}