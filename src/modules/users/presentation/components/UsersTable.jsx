import { formatDateTime } from "../../../../shared/utils/date";
import StatusBadge from "../../../../shared/components/ui/StatusBadge";
import UserManagementActions from "./UserManagementActions";
import UserPermissionsEditor from "./UserPermissionsEditor";

export default function UsersTable({ users = [] }) {
  const safeUsers = Array.isArray(users)
    ? users.filter((item) => item && item.id)
    : [];

  if (!safeUsers.length) {
    return <div className="helper-text">Henüz kullanıcı kaydı bulunmuyor.</div>;
  }

  return (
    <div className="users-table-stack">
      {safeUsers.map((userItem) => (
        <div key={userItem.id} className="user-management-card">
          <div className="user-management-card__header">
            <div className="user-management-card__identity">
              <h4>{userItem.fullName || "-"}</h4>
              <p>
                @{userItem.username || "-"} • {userItem.email || "-"}
              </p>
            </div>

            <div className="user-management-card__badges">
              <StatusBadge tone="warning">
                {userItem.roleName || "rol yok"}
              </StatusBadge>
              <StatusBadge tone="default">
                {userItem.organizationName || "organizasyon yok"}
              </StatusBadge>
              <StatusBadge tone={userItem.isActive ? "success" : "danger"}>
                {userItem.isActive ? "active" : "inactive"}
              </StatusBadge>
            </div>
          </div>

          <div className="user-management-card__meta">
            <span>
              <strong>ID:</strong> {userItem.id}
            </span>
            <span>
              <strong>Organizasyon:</strong> {userItem.organizationName || "-"}
            </span>
            <span>
              <strong>Oluşturulma:</strong> {formatDateTime(userItem.createdAt)}
            </span>
          </div>

          <div className="user-management-card__actions-block">
            <h5>Kullanıcı Aksiyonları</h5>
            <UserManagementActions userItem={userItem} />
          </div>

          <div className="user-management-card__permissions">
            <h5>Sayfa İzinleri</h5>
            <UserPermissionsEditor userItem={userItem} />
          </div>
        </div>
      ))}
    </div>
  );
}