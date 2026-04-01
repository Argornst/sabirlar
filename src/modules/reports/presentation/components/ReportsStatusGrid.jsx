import StatusBadge from "../../../../shared/components/ui/StatusBadge";

function getTone(status) {
  switch (status) {
    case "odendi":
    case "paid":
    case "odendi_faturalandi":
      return "success";
    case "cancelled":
    case "iptal":
      return "danger";
    case "beklemede":
    case "pending":
    case "faturalandi":
      return "warning";
    default:
      return "default";
  }
}

function getReadableSaleStatus(status) {
  switch (status) {
    case "odendi_faturalandi":
      return "Tamamlandı";
    case "odendi":
      return "Ödendi • Faturalanmadı";
    case "faturalandi":
      return "Faturalandı • Ödenmedi";
    case "beklemede":
      return "Beklemede";
    case "paid":
      return "Ödendi";
    case "pending":
      return "Beklemede";
    case "cancelled":
    case "iptal":
      return "İptal";
    default:
      return status || "-";
  }
}

export default function ReportsStatusGrid({ salesByStatus = {} }) {
  const entries = Object.entries(salesByStatus);

  if (!entries.length) {
    return null;
  }

  return (
    <div className="reports-status-grid">
      {entries.map(([status, count]) => (
        <div key={status} className="reports-status-grid__card">
          <div className="reports-status-grid__badge">
            <StatusBadge tone={getTone(status)}>
              {getReadableSaleStatus(status)}
            </StatusBadge>
          </div>
          <strong>{count}</strong>
          <span>adet kayıt</span>
        </div>
      ))}
    </div>
  );
}