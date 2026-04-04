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

function getTotalQuantity(items = []) {
  return items.reduce((acc, item) => acc + Number(item.quantity ?? 0), 0);
}

function getPrimaryUnit(items = []) {
  if (!Array.isArray(items) || !items.length) return "adet";

  const firstUnit = items[0]?.unit;
  return firstUnit || "adet";
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

  function toggleEditing(saleId) {
    setEditingSaleId((prev) => (prev === saleId ? null : saleId));
  }

  return (
    <div className="sales-table-shell">
      <div className="sales-table-wrap">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Müşteri</th>
              <th>Ürün Bilgisi</th>
              <th>Tarih</th>
              <th>Kalem</th>
              <th>Toplam Adet</th>
              <th>Genel Toplam</th>
              <th>Durum</th>
              <th className="sales-table__actions-col">İşlemler</th>
            </tr>
          </thead>

          <tbody>
            {safeSales.map((sale) => {
              const isExpanded = expandedSaleId === sale.id;
              const isEditing = editingSaleId === sale.id;

              return (
                <FragmentRow
                  key={sale.id}
                  sale={sale}
                  isExpanded={isExpanded}
                  isEditing={isEditing}
                  products={products}
                  onToggleExpanded={toggleExpanded}
                  onToggleEditing={toggleEditing}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FragmentRow({
  sale,
  isExpanded,
  isEditing,
  products,
  onToggleExpanded,
  onToggleEditing,
}) {
  const paymentTone = getPaymentTone(sale.paymentStatus);
  const invoiceTone = getInvoiceTone(sale.invoiceStatus);

  return (
    <>
      <tr className="sales-table__row">
        <td>
          <div className="sales-table__customer">
            <strong>{sale.customerName || "-"}</strong>
            <span>#{sale.id}</span>
          </div>
        </td>

        <td>
          <div className="sales-table__product">
            <strong>{getItemPreview(sale.items)}</strong>
          </div>
        </td>

        <td>
          <span className="sales-table__muted">{formatDate(sale.saleDate)}</span>
        </td>

        <td>
          <strong>{sale.items?.length ?? 0}</strong>
        </td>

        <td>
          <div className="sales-table__qty">
            <strong>{getTotalQuantity(sale.items ?? [])}</strong>
            <span>{getPrimaryUnit(sale.items)}</span>
          </div>
        </td>

        <td>
          <div className="sales-table__amount">
            <strong>{formatCurrency(sale.totalAmount ?? 0, "TRY")}</strong>
          </div>
        </td>

        <td>
          <div className="sales-table__badges sales-table__badges--compact">
            <StatusBadge tone={paymentTone}>
              {sale.paymentStatus === "odendi" ? "Ödendi" : "Beklemede"}
            </StatusBadge>

            <StatusBadge tone={invoiceTone}>
              {sale.invoiceStatus === "faturalandi"
                ? "Faturalandı"
                : "Faturalanmadı"}
            </StatusBadge>
          </div>
        </td>

        <td className="sales-table__actions-col">
          <SaleRowActions
            sale={sale}
            isExpanded={isExpanded}
            isEditing={isEditing}
            onToggleExpanded={() => onToggleExpanded(sale.id)}
            onEdit={() => onToggleEditing(sale.id)}
          />
        </td>
      </tr>

      {isEditing ? (
        <tr className="sales-table__detail-row">
          <td colSpan={8}>
            <div className="sales-table__detail-card">
              <EditSaleInlineForm
                sale={sale}
                products={products}
                onCancel={() => onToggleEditing(sale.id)}
                onSuccess={() => onToggleEditing(sale.id)}
              />
            </div>
          </td>
        </tr>
      ) : null}

      {isExpanded ? (
        <tr className="sales-table__detail-row">
          <td colSpan={8}>
            <div className="sales-table__detail-card">
              <SaleDetailsPanel sale={sale} />
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}