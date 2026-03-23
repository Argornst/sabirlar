import { formatCurrency } from "../../../../shared/utils/currency";
import StatCard from "../../../../shared/components/ui/StatCard";

export default function DashboardStats({ summary }) {
  return (
    <div className="stats-grid stats-grid--dashboard">
      <StatCard
        label="Toplam Satış"
        value={summary.totalSalesCount}
        helper="Sistemdeki tüm satış kayıtları"
      />
      <StatCard
        label="Toplam Ürün"
        value={summary.totalProductsCount}
        helper="Kayıtlı ürün sayısı"
      />
      <StatCard
        label="Toplam Kullanıcı"
        value={summary.totalUsersCount}
        helper="Panel kullanıcıları"
      />
      <StatCard
        label="Toplam Ciro"
        value={formatCurrency(summary.totalRevenue, "TRY")}
        helper="Hesaplanan gelir toplamı"
      />
      <StatCard
        label="Ödenmiş Satış"
        value={summary.paidSalesCount}
        helper="Tamamlanan satışlar"
      />
      <StatCard
        label="Bekleyen Satış"
        value={summary.pendingSalesCount}
        helper="İşlem bekleyen kayıtlar"
      />
    </div>
  );
}