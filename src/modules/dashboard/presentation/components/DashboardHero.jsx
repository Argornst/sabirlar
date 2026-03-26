import { formatCurrency } from "../../../../shared/utils/currency";

export default function DashboardHero({ summary }) {
  return (
    <div className="dashboard-hero dashboard-hero--ultra dashboard-hero--premium">
      <div className="dashboard-hero__glow" />

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
            helper="Tüm satışlardan oluşan toplam hacim"
            featured
            icon={RevenueIcon}
          />

          <Metric
            label="Toplam Satış"
            value={summary.totalSalesCount ?? 0}
            helper="Oluşturulan toplam işlem adedi"
            icon={SalesIcon}
          />

          <Metric
            label="Bekleyen"
            value={summary.pendingSalesCount ?? 0}
            helper="Henüz kapanmamış satışlar"
            icon={PendingIcon}
          />
        </div>
      </div>

      <div className="dashboard-hero__side">
        <MiniCard
          label="Kullanıcılar"
          value={summary.totalUsersCount ?? 0}
          helper="Aktif ekip üyeleri"
          icon={UsersIcon}
        />
        <MiniCard
          label="Ürünler"
          value={summary.totalProductsCount ?? 0}
          helper="Yönetilen katalog"
          icon={BoxIcon}
        />
        <MiniCard
          label="Ödenmiş"
          value={summary.paidSalesCount ?? 0}
          helper="Tahsilatı tamamlanan kayıt"
          icon={PaidIcon}
          featured
        />
      </div>
    </div>
  );
}

function Metric({ label, value, helper, featured, icon: Icon }) {
  return (
    <div
      className={`dashboard-hero__metric ${
        featured ? "dashboard-hero__metric--featured" : ""
      }`}
    >
      <div className="dashboard-hero__metric-top">
        <div className="dashboard-hero__metric-icon">
          <Icon />
        </div>
        <span>{label}</span>
      </div>

      <strong>{value}</strong>

      {helper ? (
        <small className="dashboard-hero__metric-helper">{helper}</small>
      ) : null}
    </div>
  );
}

function MiniCard({ label, value, helper, icon: Icon, featured = false }) {
  return (
    <div
      className={`dashboard-hero__mini-card dashboard-hero__mini-card--premium ${
        featured ? "dashboard-hero__mini-card--featured" : ""
      }`}
    >
      <div className="dashboard-hero__mini-card-top">
        <div className="dashboard-hero__mini-card-icon">
          <Icon />
        </div>
        <span>{label}</span>
      </div>

      <strong>{value}</strong>

      {helper ? (
        <small className="dashboard-hero__mini-card-helper">{helper}</small>
      ) : null}
    </div>
  );
}

/* ===== ICONS ===== */

function RevenueIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v18" />
      <path d="M16.5 7.5c0-1.9-2-3.5-4.5-3.5S7.5 5.6 7.5 7.5 9.5 11 12 11s4.5 1.6 4.5 3.5S14.5 18 12 18s-4.5-1.6-4.5-3.5" />
    </svg>
  );
}

function SalesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5h16" />
      <path d="M7 16v-4.5" />
      <path d="M12 16V7" />
      <path d="M17 16v-6.5" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.5 18.5a4.5 4.5 0 0 0-9 0" />
      <circle cx="12" cy="8.5" r="3.2" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 21 8-4.5v-8L12 4 4 8.5v8L12 21Z" />
      <path d="M12 21v-8" />
      <path d="m4 8.5 8 4.5 8-4.5" />
    </svg>
  );
}

function PaidIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12 4.2 4.2L19 6.5" />
    </svg>
  );
}