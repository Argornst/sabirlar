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

export default function SalesStatusSummary({ salesByStatus = {} }) {
  const entries = Object.entries(salesByStatus);

  if (!entries.length) {
    return <div className="helper-text">Durum bazlı satış verisi bulunmuyor.</div>;
  }

  return (
    <div className="status-summary-grid">
      {entries.map(([status, count]) => (
        <div key={status} className="status-summary-card">
          <StatusBadge tone={getTone(status)}>{status}</StatusBadge>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  );
}