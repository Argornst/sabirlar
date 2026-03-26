import StatusBadge from "../../../../shared/components/ui/StatusBadge";

export default function DashboardStatusOverview({ summary }) {
  const items = [
    {
      key: "paid",
      label: "Ödenmiş",
      value: summary.paidSalesCount ?? 0,
      tone: "success",
      helper: "Tahsilatı tamamlanan satışlar",
      icon: PaidIcon,
      featured: true,
    },
    {
      key: "pending",
      label: "Bekleyen",
      value: summary.pendingSalesCount ?? 0,
      tone: "warning",
      helper: "İşlemde kalan açık kayıtlar",
      icon: PendingIcon,
    },
    {
      key: "users",
      label: "Kullanıcı",
      value: summary.totalUsersCount ?? 0,
      tone: "default",
      helper: "Sisteme erişimi olan ekip üyeleri",
      icon: UsersIcon,
    },
    {
      key: "products",
      label: "Ürün",
      value: summary.totalProductsCount ?? 0,
      tone: "default",
      helper: "Aktif katalogdaki toplam ürün",
      icon: ProductsIcon,
    },
  ];

  return (
    <div className="dashboard-status-grid dashboard-status-grid--premium">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.key}
            className={`dashboard-status-card dashboard-status-card--premium ${
              item.featured ? "dashboard-status-card--featured" : ""
            } dashboard-status-card--tone-${item.tone}`}
          >
            <div className="dashboard-status-card__glow" />

            <div className="dashboard-status-card__top">
              <div className="dashboard-status-card__icon">
                <Icon />
              </div>

              <StatusBadge tone={item.tone}>{item.label}</StatusBadge>
            </div>

            <strong>{item.value}</strong>

            <span className="dashboard-status-card__hint">
              {item.helper}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PaidIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12 4.2 4.2L19 6.5" />
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

function ProductsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 21 8-4.5v-8L12 4 4 8.5v8L12 21Z" />
      <path d="M12 21v-8" />
      <path d="m4 8.5 8 4.5 8-4.5" />
    </svg>
  );
}