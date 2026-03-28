import {
  ALL_PAGE_KEYS,
  PAGE_PERMISSION_LABELS,
} from "../../../../shared/constants/permissions";
import {
  getSafePagePermissions,
  normalizePagePermissions,
} from "../../../../shared/lib/permissions";
import Button from "../../../../shared/components/ui/Button";
import { useUpdateUserPermissions } from "../hooks/useUpdateUserPermissions";

export default function UserPermissionsEditor({ userItem }) {
  const mutation = useUpdateUserPermissions();

  if (!userItem || !userItem.id) {
    return (
      <div className="helper-text">
        Kullanıcı izinleri yüklenemedi.
      </div>
    );
  }

  const currentPermissions = getSafePagePermissions(userItem);

  async function handleToggle(pageKey) {
  console.log("toggle clicked", {
    userId: userItem?.id,
    pageKey,
    currentPermissions,
  });

  if (!userItem?.id) {
    console.log("userId yok!");
    return;
  }

  const nextPermissions = normalizePagePermissions({
    ...currentPermissions,
    [pageKey]: !currentPermissions[pageKey],
  });

  try {
    const result = await mutation.mutateAsync({
      userId: userItem.id,
      pagePermissions: nextPermissions,
    });

    console.log("mutation sonucu", result);
    console.log("gönderilen nextPermissions", nextPermissions);
  } catch (error) {
    console.error("Permission update error:", error);
  }

}

  return (
    <div className="permissions-editor">
      {ALL_PAGE_KEYS.map((pageKey) => {
        const isEnabled = Boolean(currentPermissions[pageKey]);

        return (
          <div key={pageKey} className="permissions-editor__item">
            <div className="permissions-editor__meta">
              <strong>{PAGE_PERMISSION_LABELS[pageKey]}</strong>
              <span>{isEnabled ? "Açık" : "Kapalı"}</span>
            </div>

            <Button
              type="button"
              variant={isEnabled ? "secondary" : "primary"}
              onClick={() => handleToggle(pageKey)}
              disabled={mutation.isPending}
            >
              {isEnabled ? "Kapat" : "Aç"}
            </Button>
          </div>
        );
      })}

      {mutation.error ? (
        <div className="error-text">
          {mutation.error.message || "İzinler güncellenemedi."}
        </div>
      ) : null}
    </div>
  );
}