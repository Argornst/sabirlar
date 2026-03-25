import { formatCurrency } from "../../../../shared/utils/currency";

export default function DashboardHero({ summary }) {
  return (
    <div className="dashboard-hero dashboard-hero--ultra dashboard-hero--premium">
      <div className="dashboard-hero__main">
        <span className="dashboard-hero__eyebrow">
          <span className="dashboard-hero__eyebrow-dot" />
          Live Performance
        </span>

        <h2>
          Satış operasyonlarının <span>canlı özeti</span>
        </h2>

        <p>
          Tüm satış akışı, kullanıcı yoğunluğu ve gelir performansı tek panelde
          okunabilir hale getirildi. Kritik metrikler artık daha görünür ve
          daha hızlı yorumlanabilir.
        </p>

        <div className="dashboard-hero__metrics">
          <Metric
            label="Toplam Ciro"
            value={formatCurrency(summary.totalRevenue ?? 0, "TRY")}
            featured
          />

          <Metric
            label="Toplam Satış"
            value={summary.totalSalesCount ?? 0}
          />

          <Metric
            label="Bekleyen"
            value={summary.pendingSalesCount ?? 0}
          />
        </div>
      </div>

      <div className="dashboard-hero__side">
        <MiniCard label="Kullanıcılar" value={summary.totalUsersCount ?? 0} />
        <MiniCard label="Ürünler" value={summary.totalProductsCount ?? 0} />
        <MiniCard label="Ödenmiş" value={summary.paidSalesCount ?? 0} />
      </div>
    </div>
  );
}

function Metric({ label, value, featured }) {
  return (
    <div
      className={`dashboard-hero__metric ${
        featured ? "dashboard-hero__metric--featured" : ""
      }`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="dashboard-hero__mini-card dashboard-hero__mini-card--premium">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}