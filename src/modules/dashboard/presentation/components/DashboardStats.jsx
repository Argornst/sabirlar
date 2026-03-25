import { formatCurrency } from "../../../../shared/utils/currency";
import StatCard from "../../../../shared/components/ui/StatCard";

export default function DashboardStats({ summary }) {
  return (
    <div className="stats-grid stats-grid--dashboard stats-grid--premium">
      <StatCard
        label="Toplam Satış"
        value={summary.totalSalesCount}
        helper="Tüm satış kayıtları"
      />

      <StatCard
        label="Toplam Ürün"
        value={summary.totalProductsCount}
        helper="Ürün sayısı"
      />

      <StatCard
        label="Toplam Kullanıcı"
        value={summary.totalUsersCount}
        helper="Panel kullanıcıları"
      />

      <StatCard
        label="Toplam Ciro"
        value={formatCurrency(summary.totalRevenue, "TRY")}
        helper="Toplam gelir"
      />

      <StatCard
        label="Ödenmiş"
        value={summary.paidSalesCount}
        helper="Tamamlanan satışlar"
      />

      <StatCard
        label="Bekleyen"
        value={summary.pendingSalesCount}
        helper="İşlem bekleyenler"
      />
    </div>
  );
}