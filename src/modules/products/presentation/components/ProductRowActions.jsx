import Button from "../../../../shared/components/ui/Button";
import { useDeleteProduct } from "../hooks/useDeleteProduct";
import { useToggleProductActive } from "../hooks/useToggleProductActive";

export default function ProductRowActions({ product, onEdit }) {
  const toggleMutation = useToggleProductActive();
  const deleteMutation = useDeleteProduct();

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

    if (!confirmed) {
      return;
    }

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
    <div className="row-actions">
      <Button
        type="button"
        variant="ghost"
        onClick={onEdit}
        disabled={toggleMutation.isPending || deleteMutation.isPending}
      >
        Düzenle
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={handleToggleActive}
        disabled={toggleMutation.isPending || deleteMutation.isPending}
      >
        {product.isActive ? "Pasifleştir" : "Aktifleştir"}
      </Button>

      <Button
        type="button"
        variant="danger"
        onClick={handleDelete}
        disabled={toggleMutation.isPending || deleteMutation.isPending}
      >
        Sil
      </Button>
    </div>
  );
}