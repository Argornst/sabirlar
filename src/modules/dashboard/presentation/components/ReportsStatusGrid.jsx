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
            <StatusBadge tone={getTone(status)}>{status}</StatusBadge>
          </div>
          <strong>{count}</strong>
          <span>adet kayıt</span>
        </div>
      ))}
    </div>
  );
}