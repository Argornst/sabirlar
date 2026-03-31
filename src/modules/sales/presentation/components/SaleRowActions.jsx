import Button from "../../../../shared/components/ui/Button";
import { useDeleteSale } from "../hooks/useDeleteSale";
import { useUpdateSaleStatus } from "../hooks/useUpdateSaleStatus";

function buildNextStatus(nextPaymentStatus, nextInvoiceStatus) {
  if (nextPaymentStatus === "odendi" && nextInvoiceStatus === "faturalandi") {
    return "odendi_faturalandi";
  }

  if (nextPaymentStatus === "odendi") {
    return "odendi";
  }

  if (nextInvoiceStatus === "faturalandi") {
    return "faturalandi";
  }

  return "beklemede";
}

export default function SaleRowActions({ sale, onEdit }) {
  const deleteMutation = useDeleteSale();
  const updateStatusMutation = useUpdateSaleStatus();

  const isBusy = deleteMutation.isPending || updateStatusMutation.isPending;

  async function handleToggle(nextPaymentStatus, nextInvoiceStatus) {
    try {
      const nextStatus = buildNextStatus(
        nextPaymentStatus,
        nextInvoiceStatus
      );

      await updateStatusMutation.mutateAsync({
        saleId: sale.id,
        nextStatus,
      });
    } catch (error) {
      console.error("Sale status update error:", error);
    }
  }

  async function handleDelete() {
    if (!sale?.id) {
      console.error("Sale delete error: sale.id is missing", sale);
      return;
    }

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
        {updateStatusMutation.isPending ? "Güncelleniyor..." : "Ödendi"}
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
        {updateStatusMutation.isPending ? "Güncelleniyor..." : "Faturalandı"}
      </button>

      <Button
        type="button"
        variant="danger"
        onClick={handleDelete}
        disabled={isBusy || !sale?.id}
      >
        {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
      </Button>
    </div>
  );
}