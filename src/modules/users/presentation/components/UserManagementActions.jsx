import Button from "../../../../shared/components/ui/Button";
import { useResetUserPermissions } from "../hooks/useResetUserPermissions";
import { useToggleUserActive } from "../hooks/useToggleUserActive";
import UserOrganizationSelect from "./UserOrganizationSelect";
import UserRoleSelect from "./UserRoleSelect";

export default function UserManagementActions({ userItem }) {
  const toggleMutation = useToggleUserActive();
  const resetPermissionsMutation = useResetUserPermissions();

  async function handleToggleActive() {
  console.log("toggle active clicked", {
    userId: userItem?.id,
    current: userItem?.isActive,
    next: !userItem?.isActive,
  });

  if (!userItem?.id) {
    console.log("userId yok!");
    return;
  }

  try {
    await toggleMutation.mutateAsync({
      userId: userItem.id,
      nextIsActive: !userItem.isActive,
    });

    console.log("active mutation gönderildi");
  } catch (error) {
    console.error("User active toggle error:", error);
  }
}

  async function handleResetPermissions() {
  console.log("reset permissions clicked", {
    userId: userItem?.id,
    roleName: userItem?.roleName,
  });

  if (!userItem?.id) {
    console.log("userId yok!");
    return;
  }

  try {
    await resetPermissionsMutation.mutateAsync({
      userId: userItem.id,
      roleName: userItem.roleName,
    });

    console.log("reset permissions mutation gönderildi");
  } catch (error) {
    console.error("User permission reset error:", error);
  }
}
}