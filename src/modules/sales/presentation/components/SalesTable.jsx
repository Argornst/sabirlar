import { useState } from "react";
import { formatCurrency } from "../../../../shared/utils/currency";
import { formatDateTime } from "../../../../shared/utils/date";
import StatusBadge from "../../../../shared/components/ui/StatusBadge";
import EditSaleInlineForm from "./EditSaleInlineForm";
import SaleDetailsPanel from "./SaleDetailsPanel";
import SaleRowActions from "./SaleRowActions";

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

export default function SalesTable({ sales = [] }) {
  const [expandedSaleId, setExpandedSaleId] = useState(null);
  const [editingSaleId, setEditingSaleId] = useState(null);

  const safeSales = Array.isArray(sales)
    ? sales.filter((item) => item && item.id)
    : [];

  if (!safeSales.length) {
    return <div className="helper-text">Henüz satış kaydı bulunmuyor.</div>;
  }

  function toggleExpanded(saleId) {
    setExpandedSaleId((prev) => (prev === saleId ? null : saleId));
  }

  return (
    <div className="sales-list-stack">
      {safeSales.map((sale) => {
        const isExpanded = expandedSaleId === sale.id;
        const isEditing = editingSaleId === sale.id;
        const flags = getSaleFlags(sale.status);

        return (
          <div key={sale.id} className="sales-record-card">
            <div className="sales-record-card__top">
              <div className="sales-record-card__identity">
                <h4>{sale.customerName || "-"}</h4>
                <p>
                  {sale.productName || "-"} • {formatDateTime(sale.saleDate)}
                </p>
              </div>

              <div className="sales-record-card__badges">
                <StatusBadge tone={flags.paid ? "success" : "warning"}>
                  {flags.paid ? "Ödendi" : "Beklemede"}
                </StatusBadge>

                <StatusBadge tone={flags.invoiced ? "success" : "default"}>
                  {flags.invoiced ? "Faturalandı" : "Faturalanmadı"}
                </StatusBadge>
              </div>
            </div>

            <div className="sales-record-card__summary">
              <div className="sales-record-card__summary-item">
                <span>Adet</span>
                <strong>{sale.quantity ?? 0}</strong>
              </div>

              <div className="sales-record-card__summary-item">
                <span>Birim</span>
                <strong>{sale.unit || "-"}</strong>
              </div>

              <div className="sales-record-card__summary-item">
                <span>Toplam</span>
                <strong>{formatCurrency(sale.totalAmount ?? 0, "TRY")}</strong>
              </div>

              <div className="sales-record-card__summary-item">
                <span>Oluşturan</span>
                <strong>{sale.createdBy || "-"}</strong>
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
                <h4 className="inline-form-title">Satış Düzenle</h4>
                <EditSaleInlineForm
                  sale={sale}
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