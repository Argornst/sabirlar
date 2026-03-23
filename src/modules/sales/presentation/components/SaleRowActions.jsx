import Button from "../../../../shared/components/ui/Button";
import { useDeleteSale } from "../hooks/useDeleteSale";
import { useUpdateSaleStatus } from "../hooks/useUpdateSaleStatus";

const statusFlow = {
  beklemede: "odendi",
  odendi: "faturalandi",
  faturalandi: "odendi_faturalandi",
  odendi_faturalandi: "beklemede",
};

function getNextStatus(currentStatus) {
  return statusFlow[currentStatus] || "beklemede";
}

function getStatusButtonLabel(currentStatus) {
  const next = getNextStatus(currentStatus);

  switch (next) {
    case "odendi":
      return "Ödendi Yap";
    case "faturalandi":
      return "Faturalandı Yap";
    case "odendi_faturalandi":
      return "Tamamlandı Yap";
    default:
      return "Beklemede Yap";
  }
}

export default function SaleRowActions({ sale, onEdit }) {
  const updateMutation = useUpdateSaleStatus();
  const deleteMutation = useDeleteSale();

  if (!sale || !sale.id) {
    return <div className="helper-text">Aksiyon yok</div>;
  }

  async function handleStatusAdvance() {
    try {
      await updateMutation.mutateAsync({
        saleId: sale.id,
        nextStatus: getNextStatus(sale.status),
      });
    } catch (error) {
      console.error("Sale status update error:", error);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `${sale.customerName || "Bu"} satış kaydını silmek istediğine emin misin?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({
        saleId: sale.id,
        customerName: sale.customerName,
      });
    } catch (error) {
      console.error("Sale delete error:", error);
    }
  }

  return (
    <div className="row-actions">
      <Button
        type="button"
        variant="ghost"
        onClick={onEdit}
        disabled={updateMutation.isPending || deleteMutation.isPending}
      >
        Düzenle
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={handleStatusAdvance}
        disabled={updateMutation.isPending || deleteMutation.isPending}
      >
        {getStatusButtonLabel(sale.status)}
      </Button>

      <Button
        type="button"
        variant="danger"
        onClick={handleDelete}
        disabled={updateMutation.isPending || deleteMutation.isPending}
      >
        Sil
      </Button>
    </div>
  );
}