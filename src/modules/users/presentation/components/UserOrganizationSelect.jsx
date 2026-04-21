import Field from "../../../../shared/components/ui/Field";
import Select from "../../../../shared/components/ui/Select";
import { useOrganizationsQuery } from "../hooks/useOrganizationsQuery";
import { useUpdateUserOrganization } from "../hooks/useUpdateUserOrganization";

export default function UserOrganizationSelect({ userItem }) {
  const { data: organizations = [], isLoading } = useOrganizationsQuery();
  const mutation = useUpdateUserOrganization();

  async function handleChange(event) {
    const rawValue = event.target.value;
    const nextOrganizationId = rawValue === "" ? null : Number(rawValue);

    if (!userItem?.id) {
      return;
    }

    if (nextOrganizationId === Number(userItem.organizationId ?? null)) {
      return;
    }

    try {
      await mutation.mutateAsync({
        userId: userItem.id,
        organizationId: nextOrganizationId,
      });
    } catch (error) {
      console.error("User organization update error:", error);
    }
  }

  return (
    <Field
      label="Organizasyon"
      htmlFor={`organization-select-${userItem.id}`}
      className="user-management-select"
      error={mutation.error?.message || undefined}
    >
      <Select
        id={`organization-select-${userItem.id}`}
        className="user-management-select__control"
        value={userItem.organizationId ?? ""}
        onChange={handleChange}
        disabled={isLoading || mutation.isPending}
      >
        <option value="">
          {isLoading ? "Organizasyonlar yükleniyor..." : "Organizasyon seçin"}
        </option>

        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </Select>
    </Field>
  );
}
