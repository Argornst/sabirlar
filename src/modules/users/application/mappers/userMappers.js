import { getDefaultPagePermissionsByRoleName } from "../../../../shared/lib/permissions";

export function mapCreateUserFormToPayload(values, selectedRole) {
  const roleId = Number(values.roleId);
  const organizationId = Number(values.organizationId);
  const roleName = selectedRole?.name || "";

  return {
    email: values.email.trim().toLowerCase(),
    username: values.username.trim().toLowerCase(),
    full_name: values.fullName.trim(),
    password: values.password,
    role_id: roleId,
    organization_id: organizationId,
    is_active: true,
    page_permissions: getDefaultPagePermissionsByRoleName(roleName),
  };
}