import { useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "../../../../shared/utils/currency";
import { formatDateTime } from "../../../../shared/utils/date";
import StatusBadge from "../../../../shared/components/ui/StatusBadge";
import EditSaleInlineForm from "./EditSaleInlineForm";
import SaleDetailsPanel from "./SaleDetailsPanel";
import SaleRowActions from "./SaleRowActions";

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

        return (
          <motion.div
            key={sale.id}
            className="sales-record-card sales-record-card--premium"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            whileHover={{ y: -4, scale: 1.01 }}
          >
            {/* glow */}
            <div className="sales-record-card__glow" />

            {/* TOP */}
            <div className="sales-record-card__top">
              <div className="sales-record-card__identity">
                <h4>{sale.customerName || "-"}</h4>
                <p>
                  {sale.productName || "-"} • {formatDateTime(sale.saleDate)}
                </p>
              </div>

              <div className="sales-record-card__badges">
                <StatusBadge tone={getSaleStatusTone(sale.status)}>
                  {sale.status || "-"}
                </StatusBadge>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="sales-record-card__summary">
              <SummaryItem label="Adet" value={sale.quantity ?? 0} />
              <SummaryItem label="Birim" value={sale.unit || "-"} />
              <SummaryItem
                label="Ara Toplam"
                value={formatCurrency(sale.subtotal ?? 0, "TRY")}
              />
              <SummaryItem
                label="KDV"
                value={formatCurrency(sale.vatAmount ?? 0, "TRY")}
              />
              <SummaryItem
                label="Toplam"
                value={formatCurrency(sale.totalAmount ?? 0, "TRY")}
                highlight
              />
            </div>

            {/* ACTIONS */}
            <div className="sales-record-card__actions">
              <button
                type="button"
                className="ui-button ui-button--ghost"
                onClick={() => toggleExpanded(sale.id)}
              >
                {isExpanded ? "Detayı Kapat" : "Detayı Aç"}
              </button>

              <SaleRowActions
                sale={sale}
                onEdit={() =>
                  setEditingSaleId((prev) =>
                    prev === sale.id ? null : sale.id
                  )
                }
              />
            </div>

            {/* EDIT */}
            {isEditing ? (
              <motion.div
                className="sale-details-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <h4 className="inline-form-title">Satış Düzenle</h4>
                <EditSaleInlineForm
                  sale={sale}
                  onCancel={() => setEditingSaleId(null)}
                  onSuccess={() => setEditingSaleId(null)}
                />
              </motion.div>
            ) : null}

            {/* DETAILS */}
            {isExpanded ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <SaleDetailsPanel sale={sale} />
              </motion.div>
            ) : null}
          </motion.div>
        );
      })}
    </div>
  );
}

function SummaryItem({ label, value, highlight }) {
  return (
    <div
      className={`sales-record-card__summary-item ${
        highlight ? "is-highlight" : ""
      }`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}