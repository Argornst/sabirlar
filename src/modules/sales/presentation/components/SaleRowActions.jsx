import Button from "../../../../shared/components/ui/Button";
import { useDeleteSale } from "../hooks/useDeleteSale";
import { useUpdateSale } from "../hooks/useUpdateSale";

function getSaleFlags(status) {
  switch (status) {
    case "odendi":
    case "paid":
      return { paid: true, invoiced: false };
    case "faturalandi":
      return { paid: false, invoiced: true };
    case "odendi_faturalandi":
      return { paid: true, invoiced: true };
    case "beklemede":
    case "pending":
    default:
      return { paid: false, invoiced: false };
  }
}

function buildSaleStatus({ paid, invoiced }) {
  if (paid && invoiced) return "odendi_faturalandi";
  if (paid) return "odendi";
  if (invoiced) return "faturalandi";
  return "beklemede";
}

export default function SaleRowActions({ sale, onEdit }) {
  const deleteMutation = useDeleteSale();
  const updateMutation = useUpdateSale();

  const flags = getSaleFlags(sale?.status);
  const isBusy = deleteMutation.isPending || updateMutation.isPending;

  async function handleToggle(nextFlags) {
    try {
      await updateMutation.mutateAsync({
        sale,
        values: {
          saleDate: sale.saleDate ? String(sale.saleDate).slice(0, 10) : "",
          customerName: sale.customerName ?? "",
          quantity: sale.quantity ?? 1,
          status: buildSaleStatus(nextFlags),
          note: sale.note ?? "",
        },
      });
    } catch (error) {
      console.error("Sale status update error:", error);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Bu satış kaydını silmek istediğine emin misin?"
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
          flags.paid ? "sales-state-toggle--active sales-state-toggle--success" : ""
        }`}
        onClick={() =>
          handleToggle({
            paid: !flags.paid,
            invoiced: flags.invoiced,
          })
        }
        disabled={isBusy}
      >
        Ödendi
      </button>

      <button
        type="button"
        className={`sales-state-toggle ${
          flags.invoiced
            ? "sales-state-toggle--active sales-state-toggle--info"
            : ""
        }`}
        onClick={() =>
          handleToggle({
            paid: flags.paid,
            invoiced: !flags.invoiced,
          })
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