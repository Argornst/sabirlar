import Field from "../../../../shared/components/ui/Field";
import Select from "../../../../shared/components/ui/Select";
import { formatRoleName } from "../../../../shared/lib/formatters";
import { useRolesQuery } from "../hooks/useRolesQuery";
import { useUpdateUserRole } from "../hooks/useUpdateUserRole";

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
    <Field
      label="Rol"
      htmlFor={`role-select-${userItem.id}`}
      className="user-management-select"
      error={mutation.error?.message || undefined}
    >
      <Select
        id={`role-select-${userItem.id}`}
        className="user-management-select__control"
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
      </Select>
    </Field>
  );
}
