import StatCard from "../../../../shared/components/ui/StatCard";
import { formatCurrency } from "../../../../shared/utils/currency";

export default function ProductsSummaryCards({ summary }) {
  return (
    <div className="stats-grid stats-grid--dashboard">
      <StatCard label="Toplam Ürün" value={summary.total} />
      <StatCard label="Aktif Ürün" value={summary.active} />
      <StatCard label="Pasif Ürün" value={summary.inactive} />
      <StatCard
        label="Ortalama Fiyat"
        value={formatCurrency(summary.averagePrice || 0, "TRY")}
      />
    </div>
  );
}