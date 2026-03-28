import { useMemo, useState } from "react";
import { formatCurrency } from "../../../../shared/utils/currency";
import { formatDate } from "../../../../shared/utils/date";
import StatusBadge from "../../../../shared/components/ui/StatusBadge";
import EditSaleInlineForm from "./EditSaleInlineForm";
import SaleDetailsPanel from "./SaleDetailsPanel";
import SaleRowActions from "./SaleRowActions";

function getPaymentTone(status) {
  return status === "odendi" ? "success" : "warning";
}

function getInvoiceTone(status) {
  return status === "faturalandi" ? "success" : "default";
}

function getItemPreview(items = []) {
  if (!items.length) return "Ürün yok";
  if (items.length === 1) return items[0].productName;
  return `${items[0].productName} +${items.length - 1} ürün`;
}

export default function SalesTable({ sales = [], products = [] }) {
  const [expandedSaleId, setExpandedSaleId] = useState(null);
  const [editingSaleId, setEditingSaleId] = useState(null);

  const safeSales = useMemo(
    () => (Array.isArray(sales) ? sales.filter((item) => item?.id) : []),
    [sales]
  );

  if (!safeSales.length) {
    return <div className="helper-text">Henüz sipariş kaydı bulunmuyor.</div>;
  }

  function toggleExpanded(saleId) {
    setExpandedSaleId((prev) => (prev === saleId ? null : saleId));
  }

  return (
    <div className="sales-list-stack">
      {safeSales.map((sale) => {
        const isExpanded = expandedSaleId === sale.id;
        const isEditing = editingSaleId === sale.id;

        return (
          <div key={sale.id} className="sales-record-card sales-record-card--order">
            <div className="sales-record-card__top">
              <div className="sales-record-card__identity sale-header">
  <h4 className="sale-customer">{sale.customerName || "-"}</h4>

  <p className="sale-meta">
    <span className="sale-date">
      {formatDate(sale.saleDate)}
    </span>

    <span className="sale-meta-separator">•</span>

    <span className="sale-product">
      {sale.items?.[0]?.productName || "Ürün yok"}
    </span>

    {sale.items?.length > 1 ? (
      <span className="sale-more">
        +{sale.items.length - 1} ürün
      </span>
    ) : null}
  </p>
</div>

              <div className="sales-record-card__badges">
                <StatusBadge tone={getPaymentTone(sale.paymentStatus)}>
                  {sale.paymentStatus === "odendi" ? "Ödendi" : "Beklemede"}
                </StatusBadge>

                <StatusBadge tone={getInvoiceTone(sale.invoiceStatus)}>
                  {sale.invoiceStatus === "faturalandi"
                    ? "Faturalandı"
                    : "Faturalanmadı"}
                </StatusBadge>
              </div>
            </div>

            <div className="sales-record-card__summary">
              <div className="sales-record-card__summary-item">
                <span>Kalem</span>
                <strong>{sale.items?.length ?? 0}</strong>
              </div>

              <div className="sales-record-card__summary-item">
                <span>Toplam Adet</span>
                <strong>
                  {(sale.items ?? []).reduce(
                    (acc, item) => acc + Number(item.quantity ?? 0),
                    0
                  )}
                </strong>
              </div>

              <div className="sales-record-card__summary-item">
                <span>Oluşturan</span>
                <strong>{sale.createdBy || "-"}</strong>
              </div>

              <div className="sales-record-card__summary-item">
                <span>Güncelleyen</span>
                <strong>{sale.updatedBy || "-"}</strong>
              </div>

              <div className="sales-record-card__summary-item summary-item--highlight">
                <span>Genel Toplam</span>
                <strong>{formatCurrency(sale.totalAmount ?? 0, "TRY")}</strong>
              </div>
            </div>

            <div className="sales-record-card__actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => toggleExpanded(sale.id)}
              >
                {isExpanded ? "Detayı Kapat" : "Detayı Aç"}
              </button>

              <SaleRowActions
                sale={sale}
                onEdit={() =>
                  setEditingSaleId((prev) => (prev === sale.id ? null : sale.id))
                }
              />
            </div>

            {isEditing ? (
              <div className="sale-details-panel">
                <h4 className="inline-form-title">Siparişi Düzenle</h4>
                <EditSaleInlineForm
                  sale={sale}
                  products={products}
                  onCancel={() => setEditingSaleId(null)}
                  onSuccess={() => setEditingSaleId(null)}
                />
              </div>
            ) : null}

            {isExpanded ? <SaleDetailsPanel sale={sale} /> : null}
          </div>
        );
      })}
    </div>
  );
}