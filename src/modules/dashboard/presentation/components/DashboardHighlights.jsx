import { formatCurrency } from "../../../../shared/utils/currency";

export default function DashboardHighlights({ summary }) {
  return (
    <div className="dashboard-highlights dashboard-highlights--premium">
      <Highlight
        title="Toplam Ciro"
        value={formatCurrency(summary.totalRevenue ?? 0, "TRY")}
        desc="Toplam satış geliri"
        primary
      />

      <Highlight
        title="Toplam Satış"
        value={summary.totalSalesCount ?? 0}
        desc="Tüm satış kayıtları"
      />

      <Highlight
        title="Toplam Ürün"
        value={summary.totalProductsCount ?? 0}
        desc="Aktif + pasif ürünler"
      />
    </div>
  );
}

function Highlight({ title, value, desc, primary }) {
  return (
    <div
      className={`dashboard-highlight-card ${
        primary ? "dashboard-highlight-card--primary" : ""
      } dashboard-highlight-card--premium`}
    >
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{desc}</p>
    </div>
  );
}