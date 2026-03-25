import { Link } from "react-router-dom";
import { ROUTES } from "../../../../shared/constants/routes";

export default function DashboardQuickActions() {
  const actions = [
    {
      label: "Yeni Satış",
      desc: "Hızlı satış oluştur",
      to: ROUTES.NEW_SALE,
      primary: true,
    },
    {
      label: "Ürünler",
      desc: "Ürünleri yönet",
      to: ROUTES.PRODUCTS,
    },
    {
      label: "Kullanıcılar",
      desc: "Ekip yönetimi",
      to: ROUTES.USERS,
    },
    {
      label: "Raporlar",
      desc: "Analizleri görüntüle",
      to: ROUTES.REPORTS,
    },
  ];

  return (
    <div className="dashboard-quick-actions dashboard-quick-actions--premium">
      {actions.map((action) => (
        <Link
          key={action.label}
          to={action.to}
          className={`dashboard-action-card ${
            action.primary ? "dashboard-action-card--primary" : ""
          }`}
        >
          <div className="dashboard-action-card__content">
            <strong>{action.label}</strong>
            <span>{action.desc}</span>
          </div>

          <span className="dashboard-action-card__arrow">→</span>
        </Link>
      ))}
    </div>
  );
}