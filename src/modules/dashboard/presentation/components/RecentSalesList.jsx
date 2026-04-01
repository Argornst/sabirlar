import { formatCurrency } from "../../../../shared/utils/currency";
import { formatDate } from "../../../../shared/utils/date";
import StatusBadge from "../../../../shared/components/ui/StatusBadge";
import {
  getInvoiceStatusMeta,
  getPaymentStatusMeta,
} from "../../../../shared/lib/salesStatus";

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
          {sales.map((sale) => {
            const paymentMeta = getPaymentStatusMeta(sale.paymentStatus);
            const invoiceMeta = getInvoiceStatusMeta(sale.invoiceStatus);

            const PaymentIcon = paymentMeta.icon;
            const InvoiceIcon = invoiceMeta.icon;

            return (
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

                <td className="data-table__status">
                  <div className="sales-status-stack">
                    <StatusBadge tone={paymentMeta.tone}>
                      <PaymentIcon size={14} weight="bold" />
                      {paymentMeta.label}
                    </StatusBadge>

                    <StatusBadge tone={invoiceMeta.tone}>
                      <InvoiceIcon size={14} weight="bold" />
                      {invoiceMeta.label}
                    </StatusBadge>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}