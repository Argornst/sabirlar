import { Link } from "react-router-dom";
import { ROUTES } from "../../../../shared/constants/routes";

export default function DashboardQuickActions() {
  const actions = [
    {
      label: "Yeni Satış",
      desc: "Hızlı satış oluştur ve akışı başlat",
      meta: "Satış ekranına git",
      to: ROUTES.NEW_SALE,
      primary: true,
      icon: PlusIcon,
    },
    {
      label: "Ürünler",
      desc: "Ürün kataloğunu görüntüle ve düzenle",
      meta: "Ürün yönetimi",
      to: ROUTES.PRODUCTS,
      icon: BoxIcon,
    },
    {
      label: "Kullanıcılar",
      desc: "Ekip üyelerini ve yetkileri yönet",
      meta: "Kullanıcı yönetimi",
      to: ROUTES.USERS,
      icon: UsersIcon,
    },
    {
      label: "Raporlar",
      desc: "Analizleri ve performans özetini incele",
      meta: "Rapor ekranı",
      to: ROUTES.REPORTS,
      icon: ChartIcon,
    },
  ];

  return (
    <div className="dashboard-quick-actions dashboard-quick-actions--ultra">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.label}
            to={action.to}
            className={`dashboard-action-card ${
              action.primary ? "dashboard-action-card--primary" : ""
            }`}
          >
            <div className="dashboard-action-card__glow" />

            <div className="dashboard-action-card__icon">
              <Icon />
            </div>

            <div className="dashboard-action-card__content">
              <strong>{action.label}</strong>
              <span>{action.desc}</span>
            </div>

            <div className="dashboard-action-card__footer">
              <small>{action.meta}</small>
              <span className="dashboard-action-card__arrow">→</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
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

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.5 18.5a4.5 4.5 0 0 0-9 0" />
      <circle cx="12" cy="8.5" r="3.2" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5h16" />
      <path d="M7 16v-3" />
      <path d="M12 16V8" />
      <path d="M17 16v-5" />
    </svg>
  );
}