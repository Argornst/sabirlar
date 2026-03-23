import { formatCurrency } from "../../../../shared/utils/currency";
import { formatDateTime } from "../../../../shared/utils/date";
import StatusBadge from "../../../../shared/components/ui/StatusBadge";

function getSaleStatusTone(status) {
  switch (status) {
    case "odendi":
    case "paid":
    case "odendi_faturalandi":
      return "success";
    case "cancelled":
    case "iptal":
      return "danger";
    case "beklemede":
    case "pending":
    case "faturalandi":
      return "warning";
    default:
      return "default";
  }
}

export default function SaleDetailsPanel({ sale }) {
  if (!sale) {
    return null;
  }

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

        <div className="sale-details-item">
          <span>KDV Tipi</span>
          <strong>{sale.vatType || "-"}</strong>
        </div>

        <div className="sale-details-item">
          <span>KDV Oranı</span>
          <strong>%{sale.vatRate ?? 0}</strong>
        </div>

        <div className="sale-details-item">
          <span>Ara Toplam</span>
          <strong>{formatCurrency(sale.subtotal ?? 0, "TRY")}</strong>
        </div>

        <div className="sale-details-item">
          <span>KDV Tutarı</span>
          <strong>{formatCurrency(sale.vatAmount ?? 0, "TRY")}</strong>
        </div>

        <div className="sale-details-item">
          <span>Genel Toplam</span>
          <strong>{formatCurrency(sale.totalAmount ?? 0, "TRY")}</strong>
        </div>

        <div className="sale-details-item">
          <span>Durum</span>
          <div>
            <StatusBadge tone={getSaleStatusTone(sale.status)}>
              {sale.status || "-"}
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