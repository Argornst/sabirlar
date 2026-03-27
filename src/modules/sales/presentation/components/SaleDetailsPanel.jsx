import { formatCurrency } from "../../../../shared/utils/currency";
import { formatDateTime } from "../../../../shared/utils/date";
import StatusBadge from "../../../../shared/components/ui/StatusBadge";

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

function getPaymentTone(isPaid) {
  return isPaid ? "success" : "warning";
}

function getInvoiceTone(isInvoiced) {
  return isInvoiced ? "success" : "default";
}

export default function SaleDetailsPanel({ sale }) {
  if (!sale) {
    return null;
  }

  const flags = getSaleFlags(sale.status);

  return (
    <div className="sale-details-panel">
      <div className="sale-details-grid">
        <div className="sale-details-item">
          <span>Satış ID</span>
          <strong>{sale.id || "-"}</strong>
        </div>

        <div className="sale-details-item">
          <span>Satış Tarihi</span>
          <strong>{formatDateTime(sale.saleDate)}</strong>
        </div>

        <div className="sale-details-item">
          <span>Müşteri</span>
          <strong>{sale.customerName || "-"}</strong>
        </div>

        <div className="sale-details-item">
          <span>Ürün</span>
          <strong>{sale.productName || "-"}</strong>
        </div>

        <div className="sale-details-item">
          <span>Adet</span>
          <strong>{sale.quantity ?? 0}</strong>
        </div>

        <div className="sale-details-item">
          <span>Birim</span>
          <strong>{sale.unit || "-"}</strong>
        </div>

        <div className="sale-details-item">
          <span>Birim Fiyat</span>
          <strong>{formatCurrency(sale.unitPrice ?? 0, "TRY")}</strong>
        </div>

        <div className="sale-details-item sale-details-item--highlight">
          <span>Genel Toplam</span>
          <strong>{formatCurrency(sale.totalAmount ?? 0, "TRY")}</strong>
        </div>

        <div className="sale-details-item">
          <span>Ödeme Durumu</span>
          <div className="sale-details-item__badges">
            <StatusBadge tone={getPaymentTone(flags.paid)}>
              {flags.paid ? "Ödendi" : "Beklemede"}
            </StatusBadge>
          </div>
        </div>

        <div className="sale-details-item">
          <span>Faturalama Durumu</span>
          <div className="sale-details-item__badges">
            <StatusBadge tone={getInvoiceTone(flags.invoiced)}>
              {flags.invoiced ? "Faturalandı" : "Faturalanmadı"}
            </StatusBadge>
          </div>
        </div>

        <div className="sale-details-item">
          <span>Oluşturan</span>
          <strong>{sale.createdBy || "-"}</strong>
        </div>

        <div className="sale-details-item">
          <span>Güncelleyen</span>
          <strong>{sale.updatedBy || "-"}</strong>
        </div>

        <div className="sale-details-item sale-details-item--full">
          <span>Not</span>
          <strong>{sale.note || "Not bulunmuyor."}</strong>
        </div>
      </div>
    </div>
  );
}