import { formatCurrency } from "../../../../shared/utils/currency";
import StatCard from "../../../../shared/components/ui/StatCard";

export default function ReportsSummaryCards({ summary }) {
  return (
    <div className="stats-grid stats-grid--dashboard">
      <StatCard
        label="Toplam Ciro"
        value={formatCurrency(summary.totalRevenue, "TRY")}
      />
      <StatCard label="Toplam Stok" value={summary.totalStock} />
      <StatCard label="Aktif Kullanıcı" value={summary.activeUsers} />
      <StatCard label="Toplam Satış" value={summary.totalSales} />
      <StatCard label="Toplam Ürün" value={summary.totalProducts} />
      <StatCard label="Toplam Kullanıcı" value={summary.totalUsers} />
    </div>
  );
}