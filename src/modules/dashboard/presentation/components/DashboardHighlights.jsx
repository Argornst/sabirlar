import { formatCurrency } from "../../../../shared/utils/currency";

export default function DashboardHighlights({ summary }) {
  return (
    <div className="dashboard-highlights">
      <div className="dashboard-highlight-card dashboard-highlight-card--primary">
        <span>Toplam Ciro</span>
        <strong>{formatCurrency(summary.totalRevenue ?? 0, "TRY")}</strong>
        <p>Satış kayıtlarından hesaplanan toplam gelir</p>
      </div>

      <div className="dashboard-highlight-card">
        <span>Toplam Satış</span>
        <strong>{summary.totalSalesCount ?? 0}</strong>
        <p>Sisteme kayıtlı toplam satış adedi</p>
      </div>

      <div className="dashboard-highlight-card">
        <span>Toplam Ürün</span>
        <strong>{summary.totalProductsCount ?? 0}</strong>
        <p>Aktif ve pasif tüm ürün tanımları</p>
      </div>
    </div>
  );
}