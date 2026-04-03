import { useRolesQuery } from "../hooks/useRolesQuery";
import { useUpdateUserRole } from "../hooks/useUpdateUserRole";
import { formatRoleName } from "../../../../shared/lib/formatters";

export default function UserRoleSelect({ userItem }) {
  const { data: roles = [], isLoading } = useRolesQuery();
  const mutation = useUpdateUserRole();

  async function handleChange(event) {
    const nextRoleId = Number(event.target.value);

    if (!nextRoleId || nextRoleId === Number(userItem.roleId)) {
      return;
    }

    try {
      await mutation.mutateAsync({
        userId: userItem.id,
        roleId: nextRoleId,
      });
    } catch (error) {
      console.error("User role update error:", error);
    }
  }

  return (
    <div className="user-management-select">
      <label
        htmlFor={`role-select-${userItem.id}`}
        className="user-management-select__label"
      >
        Rol
      </label>

      <select
        id={`role-select-${userItem.id}`}
        className="form-select user-management-select__control"
        value={userItem.roleId ?? ""}
        onChange={handleChange}
        disabled={isLoading || mutation.isPending}
      >
        <option value="">
          {isLoading ? "Roller yükleniyor..." : "Rol seçin"}
        </option>
        {roles.map((role) => (
  <option key={role.id} value={role.id}>
    {formatRoleName(role.name)}
  </option>
))}
      </select>

      {mutation.error ? (
        <div className="error-text user-management-select__error">
          {mutation.error.message || "Rol güncellenemedi."}
        </div>
      ) : null}
    </div>
  );
}