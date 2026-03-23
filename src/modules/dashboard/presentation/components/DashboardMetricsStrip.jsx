export default function DashboardMetricsStrip({ summary }) {
  const items = [
    {
      label: "Satış Dönüşümü",
      value: `${
        summary.totalSalesCount
          ? Math.round(
              ((summary.paidSalesCount ?? 0) / summary.totalSalesCount) * 100
            )
          : 0
      }%`,
      helper: "Ödenmiş / toplam satış",
    },
    {
      label: "Bekleyen Yoğunluk",
      value: `${
        summary.totalSalesCount
          ? Math.round(
              ((summary.pendingSalesCount ?? 0) / summary.totalSalesCount) * 100
            )
          : 0
      }%`,
      helper: "Bekleyen / toplam satış",
    },
    {
      label: "Ürün Başına Satış",
      value: `${
        summary.totalProductsCount
          ? (summary.totalSalesCount / summary.totalProductsCount).toFixed(1)
          : "0.0"
      }`,
      helper: "Satış / ürün oranı",
    },
    {
      label: "Kullanıcı Başına Satış",
      value: `${
        summary.totalUsersCount
          ? (summary.totalSalesCount / summary.totalUsersCount).toFixed(1)
          : "0.0"
      }`,
      helper: "Satış / kullanıcı oranı",
    },
  ];

  return (
    <div className="dashboard-metrics-strip dashboard-metrics-strip--premium">
      {items.map((item) => (
        <div key={item.label} className="dashboard-metrics-strip__item">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.helper}</small>
        </div>
      ))}
    </div>
  );
}