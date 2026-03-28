import { formatCurrency } from "../../../../shared/utils/currency";
import { formatDate } from "../../../../shared/utils/date";
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
    <div className="table-wrap table-wrap--premium table-wrap--ultra">
      <table className="data-table data-table--premium data-table--ultra">
        <thead>
          <tr>
            <th>#</th>
            <th>Tarih</th>
            <th>Müşteri</th>
            <th>Toplam</th>
            <th>Durum</th>
          </tr>
        </thead>

        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td className="data-table__id">#{sale.id}</td>

              <td className="data-table__date">
                {formatDate(sale.saleDate)}
              </td>

              <td className="data-table__customer">
                {sale.customerName}
              </td>

              <td className="data-table__amount">
                {formatCurrency(sale.totalAmount, "TRY")}
              </td>

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