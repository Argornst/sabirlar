import { formatCurrency } from "../../../../shared/utils/currency";
import { formatDate
  
 } from "../../../../shared/utils/date";
import StatusBadge from "../../../../shared/components/ui/StatusBadge";

function getPaymentTone(status) {
  return status === "odendi" ? "success" : "warning";
}

function getInvoiceTone(status) {
  return status === "faturalandi" ? "success" : "default";
}

export default function SaleDetailsPanel({ sale }) {
  if (!sale) return null;

  return (
    <div className="sale-details-panel">
      <div className="sale-details-grid">
        <div className="sale-details-item">
          <span>Sipariş No</span>
          <strong>#{sale.id}</strong>
        </div>

        <div className="sale-details-item">
          <span>Tarih</span>
          <strong>{formatDate(sale.saleDate)}</strong>
        </div>

        <div className="sale-details-item">
          <span>Müşteri</span>
          <strong>{sale.customerName || "-"}</strong>
        </div>

        <div className="sale-details-item">
          <span>Ödeme</span>
          <div className="sale-details-item__badges">
            <StatusBadge tone={getPaymentTone(sale.paymentStatus)}>
              {sale.paymentStatus === "odendi" ? "Ödendi" : "Beklemede"}
            </StatusBadge>
          </div>
        </div>

        <div className="sale-details-item">
          <span>Fatura</span>
          <div className="sale-details-item__badges">
            <StatusBadge tone={getInvoiceTone(sale.invoiceStatus)}>
              {sale.invoiceStatus === "faturalandi"
                ? "Faturalandı"
                : "Faturalanmadı"}
            </StatusBadge>
          </div>
        </div>

        <div className="sale-details-item">
          <span>Kalem Sayısı</span>
          <strong>{sale.items?.length ?? 0}</strong>
        </div>

        <div className="sale-details-item">
          <span>Oluşturan</span>
          <strong>{sale.createdBy || "-"}</strong>
        </div>

        <div className="sale-details-item">
          <span>Güncelleyen</span>
          <strong>{sale.updatedBy || "-"}</strong>
        </div>

        <div className="sale-details-item sale-details-item--highlight">
          <span>Genel Toplam</span>
          <strong>{formatCurrency(sale.totalAmount ?? 0, "TRY")}</strong>
        </div>

        <div className="sale-details-item sale-details-item--full">
          <span>Not</span>
          <strong>{sale.note || "Not bulunmuyor."}</strong>
        </div>
      </div>

      <div className="sale-items-table">
        <div className="sale-items-table__header">
          <strong>Sipariş Kalemleri</strong>
        </div>

        <div className="sale-items-table__list">
          {(sale.items ?? []).map((item, index) => (
            <div key={item.id ?? index} className="sale-items-table__row">
              <div className="sale-items-table__cell sale-items-table__cell--product">
                <span>Ürün</span>
                <strong>{item.productName}</strong>
              </div>

              <div className="sale-items-table__cell">
                <span>Adet</span>
                <strong>{item.quantity}</strong>
              </div>

              <div className="sale-items-table__cell">
                <span>Birim</span>
                <strong>{item.unit}</strong>
              </div>

              <div className="sale-items-table__cell">
                <span>Birim Fiyat</span>
                <strong>{formatCurrency(item.unitPrice, "TRY")}</strong>
              </div>

              <div className="sale-items-table__cell sale-items-table__cell--highlight">
                <span>Toplam</span>
                <strong>{formatCurrency(item.totalAmount, "TRY")}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}