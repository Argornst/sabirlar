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

export default function SalesTable({ sales = [] }) {
  if (!sales.length) {
    return <div className="helper-text">Henüz satış kaydı bulunmuyor.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tarih</th>
            <th>Müşteri</th>
            <th>Ürün</th>
            <th>Adet</th>
            <th>Birim</th>
            <th>Ara Toplam</th>
            <th>KDV</th>
            <th>Toplam</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.id}</td>
              <td>{formatDateTime(sale.saleDate)}</td>
              <td>{sale.customerName}</td>
              <td>{sale.productName}</td>
              <td>{sale.quantity}</td>
              <td>{sale.unit}</td>
              <td>{formatCurrency(sale.subtotal, "TRY")}</td>
              <td>{formatCurrency(sale.vatAmount, "TRY")}</td>
              <td>{formatCurrency(sale.totalAmount, "TRY")}</td>
              <td>
                <StatusBadge tone={getSaleStatusTone(sale.status)}>
                  {sale.status}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}