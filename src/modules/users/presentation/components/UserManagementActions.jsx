import Button from "../../../../shared/components/ui/Button";
import { useResetUserPermissions } from "../hooks/useResetUserPermissions";
import { useToggleUserActive } from "../hooks/useToggleUserActive";
import UserOrganizationSelect from "./UserOrganizationSelect";
import UserRoleSelect from "./UserRoleSelect";

export default function UserManagementActions({ userItem }) {
  const toggleMutation = useToggleUserActive();
  const resetPermissionsMutation = useResetUserPermissions();

  async function handleToggleActive() {
    if (!userItem?.id) {
      return;
    }

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
    if (!userItem?.id) {
      return;
    }

    try {
      await resetPermissionsMutation.mutateAsync({
        userId: userItem.id,
        roleName: userItem.roleName,
      });
    } catch (error) {
      console.error("User permission reset error:", error);
    }
  }

  const isBusy =
    toggleMutation.isPending || resetPermissionsMutation.isPending;

  return (
    <div className="user-management-actions">
      <div className="user-management-actions__grid">
        <UserRoleSelect userItem={userItem} />
        <UserOrganizationSelect userItem={userItem} />
      </div>

      <div className="user-management-actions__buttons">
        <Button
          type="button"
          variant={userItem?.isActive ? "secondary" : "primary"}
          onClick={handleToggleActive}
          disabled={isBusy}
          className="user-management-actions__button"
        >
          {toggleMutation.isPending
            ? "Güncelleniyor..."
            : userItem?.isActive
            ? "Pasife Al"
            : "Aktif Et"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={handleResetPermissions}
          disabled={isBusy}
          className="user-management-actions__button"
        >
          {resetPermissionsMutation.isPending
            ? "Sıfırlanıyor..."
            : "İzinleri Varsayılan Yap"}
        </Button>
      </div>

      {toggleMutation.error ? (
        <div className="error-text user-management-actions__error">
          {toggleMutation.error.message || "Kullanıcı durumu güncellenemedi."}
        </div>
      ) : null}

      {resetPermissionsMutation.error ? (
        <div className="error-text user-management-actions__error">
          {resetPermissionsMutation.error.message || "İzinler sıfırlanamadı."}
        </div>
      ) : null}
    </div>
  );
}