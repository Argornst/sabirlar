import { useDeleteProductionMutation } from "../hooks/useDeleteProductionMutation";

export function ProductionRowActions({
  item,
  onEdit,
  isEditing = false,
}) {
  const deleteMutation = useDeleteProductionMutation();
  const isBusy = deleteMutation.isPending;

  async function handleDelete() {
    if (!item?.id) return;

    const confirmed = window.confirm(
      "Bu üretim kaydını silmek istediğine emin misin?"
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(item.id);
    } catch (error) {
      console.error("Production delete error:", error);
      window.alert(
        error?.message || error?.details || "Kayıt silinirken hata oluştu."
      );
    }
  }

  return (
    <div className="production-row-actions production-row-actions--table">
      <button
        type="button"
        className={`production-icon-button production-icon-button--glow ${
          isEditing ? "production-icon-button--active" : ""
        }`}
        onClick={onEdit}
        disabled={isBusy}
        title="Düzenle"
        aria-label="Düzenle"
      >
        <EditIcon />
      </button>

      <button
        type="button"
        className="production-icon-button production-icon-button--glow production-icon-button--danger"
        onClick={handleDelete}
        disabled={isBusy}
        title="Sil"
        aria-label="Sil"
      >
        <DeleteIcon />
      </button>
    </div>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4 20 4.2-.8L19 8.4 15.6 5 4.8 15.8 4 20Z" />
      <path d="m13.8 6.8 3.4 3.4" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 7.5h15" />
      <path d="M9.5 4.5h5" />
      <path d="M18 7.5l-.8 10a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8l-.8-10" />
      <path d="M10 11v5.5" />
      <path d="M14 11v5.5" />
    </svg>
  );
}