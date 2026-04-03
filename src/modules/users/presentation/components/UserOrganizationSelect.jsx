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
    <div className="user-management-select">
      <label
        htmlFor={`organization-select-${userItem.id}`}
        className="user-management-select__label"
      >
        Organizasyon
      </label>

      <select
        id={`organization-select-${userItem.id}`}
        className="form-select user-management-select__control"
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
      </select>

      {mutation.error ? (
        <div className="error-text user-management-select__error">
          {mutation.error.message || "Organizasyon güncellenemedi."}
        </div>
      ) : null}
    </div>
  );
}