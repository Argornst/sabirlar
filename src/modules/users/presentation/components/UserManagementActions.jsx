import Button from "../../../../shared/components/ui/Button";
import { useResetUserPermissions } from "../hooks/useResetUserPermissions";
import { useToggleUserActive } from "../hooks/useToggleUserActive";
import UserOrganizationSelect from "./UserOrganizationSelect";
import UserRoleSelect from "./UserRoleSelect";

export default function UserManagementActions({ userItem }) {
  const toggleMutation = useToggleUserActive();
  const resetPermissionsMutation = useResetUserPermissions();

  async function handleToggleActive() {
    try {
      await toggleMutation.mutateAsync({
        userId: userItem.id,
        nextIsActive: !userItem.isActive,
      });
    } catch (error) {
      console.error("User active toggle error:", error);
    }
  }

  async function handleResetPermissions() {
    try {
      await resetPermissionsMutation.mutateAsync({
        userId: userItem.id,
        roleName: userItem.roleName,
      });
    } catch (error) {
      console.error("User permission reset error:", error);
    }
  }

  return (
    <div className="user-management-actions">
      <UserRoleSelect userItem={userItem} />
      <UserOrganizationSelect userItem={userItem} />

      <div className="row-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={handleToggleActive}
          disabled={toggleMutation.isPending || resetPermissionsMutation.isPending}
        >
          {userItem.isActive ? "Pasifleştir" : "Aktifleştir"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={handleResetPermissions}
          disabled={toggleMutation.isPending || resetPermissionsMutation.isPending}
        >
          İzinleri Sıfırla
        </Button>
      </div>

      {toggleMutation.error ? (
        <div className="error-text">
          {toggleMutation.error.message || "Durum güncellenemedi."}
        </div>
      ) : null}

      {resetPermissionsMutation.error ? (
        <div className="error-text">
          {resetPermissionsMutation.error.message || "İzinler sıfırlanamadı."}
        </div>
      ) : null}
    </div>
  );
}