import Button from "../../../../shared/components/ui/Button";
import { useDeleteSale } from "../hooks/useDeleteSale";
import { useUpdateSale } from "../hooks/useUpdateSale";

export default function SaleRowActions({ sale, onEdit }) {
  const deleteMutation = useDeleteSale();
  const updateMutation = useUpdateSale();

  const isBusy = deleteMutation.isPending || updateMutation.isPending;

  async function handleToggle(nextPaymentStatus, nextInvoiceStatus) {
    try {
      await updateMutation.mutateAsync({
        sale,
        values: {
          saleDate: sale.saleDate ? String(sale.saleDate).slice(0, 10) : "",
          customerName: sale.customerName ?? "",
          paymentStatus: nextPaymentStatus,
          invoiceStatus: nextInvoiceStatus,
          note: sale.note ?? "",
          items:
            sale.items?.map((item) => ({
              productId: String(item.productId),
              quantity: Number(item.quantity),
            })) ?? [],
        },
      });
    } catch (error) {
      console.error("Sale status update error:", error);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Bu sipariş kaydını silmek istediğine emin misin?"
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(sale.id);
    } catch (error) {
      console.error("Sale delete error:", error);
    }
  }

  return (
    <div className="row-actions sales-row-actions">
      <Button
        type="button"
        variant="secondary"
        onClick={onEdit}
        disabled={isBusy}
      >
        Düzenle
      </Button>

      <button
        type="button"
        className={`sales-state-toggle ${
          sale.paymentStatus === "odendi"
            ? "sales-state-toggle--active sales-state-toggle--success"
            : ""
        }`}
        onClick={() =>
          handleToggle(
            sale.paymentStatus === "odendi" ? "beklemede" : "odendi",
            sale.invoiceStatus
          )
        }
        disabled={isBusy}
      >
        Ödendi
      </button>

      <button
        type="button"
        className={`sales-state-toggle ${
          sale.invoiceStatus === "faturalandi"
            ? "sales-state-toggle--active sales-state-toggle--info"
            : ""
        }`}
        onClick={() =>
          handleToggle(
            sale.paymentStatus,
            sale.invoiceStatus === "faturalandi"
              ? "faturalanmadi"
              : "faturalandi"
          )
        }
        disabled={isBusy}
      >
        Faturalandı
      </button>

      <Button
        type="button"
        variant="danger"
        onClick={handleDelete}
        disabled={isBusy}
      >
        {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
      </Button>
    </div>
  );
}