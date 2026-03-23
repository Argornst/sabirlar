import StatCard from "../../../../shared/components/ui/StatCard";

export default function UsersSummaryCards({ summary }) {
  const roleEntries = Object.entries(summary.byRole || {});
  const topRole = roleEntries.sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="stats-grid stats-grid--dashboard">
      <StatCard label="Toplam Kullanıcı" value={summary.total} />
      <StatCard label="Aktif Kullanıcı" value={summary.active} />
      <StatCard label="Pasif Kullanıcı" value={summary.inactive} />
      <StatCard
        label="En Yaygın Rol"
        value={topRole ? `${topRole[0]} (${topRole[1]})` : "-"}
      />
    </div>
  );
}