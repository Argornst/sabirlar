import { formatCurrency } from "../../../../shared/utils/currency";
import { formatDateTime } from "../../../../shared/utils/date";
import StatusBadge from "../../../../shared/components/ui/StatusBadge";

function getTone(status) {
  if (["paid", "odendi"].includes(status)) return "success";
  if (["pending", "beklemede"].includes(status)) return "warning";
  if (["cancelled", "iptal"].includes(status)) return "danger";
  return "default";
}

export default function RecentSalesList({ sales = [] }) {
  if (!sales.length) {
    return <div className="helper-text">Satış yok</div>;
  }

  return (
    <div className="table-wrap table-wrap--premium">
      <table className="data-table data-table--premium">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tarih</th>
            <th>Müşteri</th>
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
              <td>{formatCurrency(sale.totalAmount, "TRY")}</td>
              <td>
                <StatusBadge tone={getTone(sale.status)}>
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