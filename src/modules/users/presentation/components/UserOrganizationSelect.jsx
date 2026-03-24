import { useOrganizationsListQuery } from "../../../organizations/presentation/hooks/useOrganizationsListQuery";
import { useUpdateUserOrganization } from "../hooks/useUpdateUserOrganization";

export default function UserOrganizationSelect({ userItem }) {
  const { data: organizations = [], isLoading } = useOrganizationsListQuery();
  const mutation = useUpdateUserOrganization();

  async function handleChange(event) {
    const nextOrganizationId = Number(event.target.value);

    if (!nextOrganizationId || nextOrganizationId === Number(userItem.organizationId)) {
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
    <div className="user-role-select">
      <label htmlFor={`organization-select-${userItem.id}`}>Organizasyon</label>
      <select
        id={`organization-select-${userItem.id}`}
        className="form-select"
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
        <div className="error-text">
          {mutation.error.message || "Organizasyon güncellenemedi."}
        </div>
      ) : null}
    </div>
  );
}