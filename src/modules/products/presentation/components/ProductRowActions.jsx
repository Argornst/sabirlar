import { useDeleteProduct } from "../hooks/useDeleteProduct";
import { useToggleProductActive } from "../hooks/useToggleProductActive";

export default function ProductRowActions({
  product,
  onEdit,
  isEditing = false,
}) {
  const toggleMutation = useToggleProductActive();
  const deleteMutation = useDeleteProduct();

  const isBusy = toggleMutation.isPending || deleteMutation.isPending;

  async function handleToggleActive() {
    try {
      await toggleMutation.mutateAsync({
        productId: product.id,
        nextIsActive: !product.isActive,
      });
    } catch (error) {
      console.error("Product toggle error:", error);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `${product.name} ürününü silmek istediğine emin misin?`
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({
        productId: product.id,
        productName: product.name,
      });
    } catch (error) {
      console.error("Product delete error:", error);
    }
  }

  return (
    <div className="products-row-actions products-row-actions--table">
      <button
        type="button"
        className={`products-icon-button ${
          isEditing ? "products-icon-button--active" : ""
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
        className={`products-icon-button products-icon-button--success ${
          product.isActive ? "products-icon-button--active" : ""
        }`}
        onClick={handleToggleActive}
        disabled={isBusy}
        title={product.isActive ? "Pasifleştir" : "Aktifleştir"}
        aria-label={product.isActive ? "Pasifleştir" : "Aktifleştir"}
      >
        <PowerIcon />
      </button>

      <button
        type="button"
        className="products-icon-button products-icon-button--danger"
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

function PowerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5v8" />
      <path d="M7.2 6.8a7 7 0 1 0 9.6 0" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14" />
      <path d="M9 7V4.8h6V7" />
      <path d="M8 7l.7 11.2a1 1 0 0 0 1 .8h4.6a1 1 0 0 0 1-.8L16 7" />
      <path d="M10 10.5v5" />
      <path d="M14 10.5v5" />
    </svg>
  );
}