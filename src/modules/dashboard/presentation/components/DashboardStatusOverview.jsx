import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../shared/constants/routes";
import StatusBadge from "../../../../shared/components/ui/StatusBadge";

export default function DashboardStatusOverview({ summary }) {
  const navigate = useNavigate();

  function handleClick(type) {
    navigate(`${ROUTES.SALES}?filter=${type}`);
  }

  function handleKeyDown(event, type) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick(type);
    }
  }

  const items = [
    {
      key: "completed",
      label: "Tamamlandı",
      value: summary.completedSalesCount ?? 0,
      tone: "success",
      helper: "Faturalanmış ve ödenmiş siparişler",
      icon: CheckCircleIcon,
      featured: true,
    },
    {
      key: "payment-pending",
      label: "Ödeme Bekleyen",
      value: summary.paymentPendingSalesCount ?? 0,
      tone: "warning",
      helper: "Faturalanmış ama ödenmemiş siparişler",
      icon: ClockIcon,
    },
    {
      key: "invoicing-pending",
      label: "Faturalanacak",
      value: summary.invoicingPendingSalesCount ?? 0,
      tone: "default",
      helper: "Ödenmiş ama henüz faturalanmamış siparişler",
      icon: ReceiptIcon,
    },
    {
      key: "waiting",
      label: "Beklemede",
      value: summary.waitingSalesCount ?? 0,
      tone: "default",
      helper: "Ne ödenmiş ne de faturalanmış siparişler",
      icon: PackageIcon,
    },
  ];

  return (
    <div className="dashboard-status-grid dashboard-status-grid--premium">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.key}
            role="button"
            tabIndex={0}
            onClick={() => handleClick(item.key)}
            onKeyDown={(event) => handleKeyDown(event, item.key)}
            className={`dashboard-status-card dashboard-status-card--premium ${
              item.featured ? "dashboard-status-card--featured" : ""
            } dashboard-status-card--tone-${item.tone}`}
            style={{ cursor: "pointer" }}
            aria-label={`${item.label} filtreli satışları göster`}
            title="Filtreli satışları aç"
          >
            <div className="dashboard-status-card__glow" />

            <div className="dashboard-status-card__top">
              <div className="dashboard-status-card__icon">
                <Icon />
              </div>

              <StatusBadge tone={item.tone}>{item.label}</StatusBadge>
            </div>

            <strong>{item.value}</strong>

            <span className="dashboard-status-card__hint">{item.helper}</span>
          </div>
        );
      })}
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3.5h10v17l-2.5-1.5-2.5 1.5-2.5-1.5-2.5 1.5v-17Z" />
      <path d="M10 8h4" />
      <path d="M10 12h4" />
      <path d="M10 16h3" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 7 4v10l-7 4-7-4V7l7-4Z" />
      <path d="M12 21V11" />
      <path d="m5 7 7 4 7-4" />
    </svg>
  );
}