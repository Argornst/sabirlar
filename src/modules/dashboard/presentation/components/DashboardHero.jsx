import { formatCurrency } from "../../../../shared/utils/currency";

export default function DashboardHero({ summary }) {
  return (
    <div className="dashboard-hero dashboard-hero--premium">
      <div className="dashboard-hero__main">
        <span className="dashboard-hero__eyebrow">Bugünün Görünümü</span>
        <h2>Satış operasyonlarının canlı özeti</h2>
        <p>
          Toplam ciro, kullanıcı yoğunluğu ve satış performansı tek bakışta
          görünür. Ana metrikler ve kritik sinyaller burada öne çıkar.
        </p>

        <div className="dashboard-hero__metrics">
          <div className="dashboard-hero__metric dashboard-hero__metric--featured">
            <span>Toplam Ciro</span>
            <strong>{formatCurrency(summary.totalRevenue ?? 0, "TRY")}</strong>
          </div>

          <div className="dashboard-hero__metric">
            <span>Toplam Satış</span>
            <strong>{summary.totalSalesCount ?? 0}</strong>
          </div>

          <div className="dashboard-hero__metric">
            <span>Bekleyen</span>
            <strong>{summary.pendingSalesCount ?? 0}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-hero__side">
        <div className="dashboard-hero__mini-card">
          <span>Kullanıcılar</span>
          <strong>{summary.totalUsersCount ?? 0}</strong>
        </div>

        <div className="dashboard-hero__mini-card">
          <span>Ürünler</span>
          <strong>{summary.totalProductsCount ?? 0}</strong>
        </div>

        <div className="dashboard-hero__mini-card">
          <span>Ödenmiş Satış</span>
          <strong>{summary.paidSalesCount ?? 0}</strong>
        </div>
      </div>
    </div>
  );
}