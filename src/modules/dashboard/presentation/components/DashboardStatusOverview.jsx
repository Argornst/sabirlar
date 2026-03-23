import StatusBadge from "../../../../shared/components/ui/StatusBadge";

export default function DashboardStatusOverview({ summary }) {
  const items = [
    {
      key: "paid",
      label: "Ödenmiş",
      value: summary.paidSalesCount ?? 0,
      tone: "success",
    },
    {
      key: "pending",
      label: "Bekleyen",
      value: summary.pendingSalesCount ?? 0,
      tone: "warning",
    },
    {
      key: "users",
      label: "Kullanıcı",
      value: summary.totalUsersCount ?? 0,
      tone: "default",
    },
    {
      key: "products",
      label: "Ürün",
      value: summary.totalProductsCount ?? 0,
      tone: "default",
    },
  ];

  return (
    <div className="dashboard-status-grid">
      {items.map((item) => (
        <div key={item.key} className="dashboard-status-card">
          <div className="dashboard-status-card__top">
            <StatusBadge tone={item.tone}>{item.label}</StatusBadge>
          </div>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}