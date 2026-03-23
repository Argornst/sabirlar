import { Link } from "react-router-dom";
import Button from "../../../../shared/components/ui/Button";
import { ROUTES } from "../../../../shared/constants/routes";

export default function DashboardQuickActions() {
  return (
    <div className="dashboard-quick-actions">
      <Link to={ROUTES.NEW_SALE}>
        <Button className="dashboard-quick-actions__button">Yeni Satış</Button>
      </Link>

      <Link to={ROUTES.PRODUCTS}>
        <Button variant="secondary" className="dashboard-quick-actions__button">
          Ürünleri Yönet
        </Button>
      </Link>

      <Link to={ROUTES.USERS}>
        <Button variant="secondary" className="dashboard-quick-actions__button">
          Kullanıcılar
        </Button>
      </Link>

      <Link to={ROUTES.REPORTS}>
        <Button variant="ghost" className="dashboard-quick-actions__button">
          Raporları Aç
        </Button>
      </Link>
    </div>
  );
}