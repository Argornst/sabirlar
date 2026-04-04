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

export default function SaleRowActions({
  sale,
  onEdit,
  onToggleExpanded,
  isExpanded = false,
  isEditing = false,
}) {
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
    <div className="sales-row-actions sales-row-actions--table">
      <button
        type="button"
        className={`sales-icon-button sales-icon-button--glow ${
          isExpanded ? "sales-icon-button--active" : ""
        }`}
        onClick={onToggleExpanded}
        disabled={isBusy}
        title={isExpanded ? "Detayı kapat" : "Detayı aç"}
        aria-label={isExpanded ? "Detayı kapat" : "Detayı aç"}
      >
        <DetailsIcon />
      </button>

      <button
        type="button"
        className={`sales-icon-button sales-icon-button--glow ${
          isEditing ? "sales-icon-button--active" : ""
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
        className={`sales-icon-button sales-icon-button--glow sales-icon-button--success ${
          sale.paymentStatus === "odendi" ? "sales-icon-button--active" : ""
        }`}
        onClick={() =>
          handleToggle(
            sale.paymentStatus === "odendi" ? "beklemede" : "odendi",
            sale.invoiceStatus
          )
        }
        disabled={isBusy}
        title={
          sale.paymentStatus === "odendi"
            ? "Ödemeyi geri al"
            : "Ödendi olarak işaretle"
        }
        aria-label={
          sale.paymentStatus === "odendi"
            ? "Ödemeyi geri al"
            : "Ödendi olarak işaretle"
        }
      >
        <PaidIcon />
      </button>

      <button
        type="button"
        className={`sales-icon-button sales-icon-button--glow sales-icon-button--info ${
          sale.invoiceStatus === "faturalandi" ? "sales-icon-button--active" : ""
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
        title={
          sale.invoiceStatus === "faturalandi"
            ? "Fatura durumunu geri al"
            : "Faturalandı olarak işaretle"
        }
        aria-label={
          sale.invoiceStatus === "faturalandi"
            ? "Fatura durumunu geri al"
            : "Faturalandı olarak işaretle"
        }
      >
        <InvoiceIcon />
      </button>

      <button
        type="button"
        className="sales-icon-button sales-icon-button--glow sales-icon-button--danger"
        onClick={handleDelete}
        disabled={isBusy || !sale?.id}
        title="Sil"
        aria-label="Sil"
      >
        <DeleteIcon />
      </button>
    </div>
  );
}

function DetailsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 12s3-5.5 8.5-5.5S20.5 12 20.5 12 17.5 17.5 12 17.5 3.5 12 3.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
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

function PaidIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5c0 0-1 0-1 2.5s1 2.5 1 2.5" />
      <path d="M18 9.5c0 0 1 0 1 2.5s-1 2.5-1 2.5" />
    </svg>
  );
}

function InvoiceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3.5h10v17l-2.5-1.5-2.5 1.5-2.5-1.5-2.5 1.5v-17Z" />
      <path d="M10 8h4" />
      <path d="M10 12h4" />
      <path d="M10 16h3" />
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