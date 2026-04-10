function getSummary(data) {
  return (data?.rows || []).reduce(
    (acc, log) => {
      acc.total += 1;

      if (log.actionType === "bulk_move") {
        acc.bulk += 1;
      } else if (log.actionType === "move") {
        acc.single += 1;
      } else if (log.actionType === "update") {
        acc.update += 1;
      }

      return acc;
    },
    {
      total: 0,
      single: 0,
      bulk: 0,
      update: 0,
    }
  );
}

export default function DispatchLogsSummaryCards({ data }) {
  const summary = getSummary(data);

  return (
    <div className="dispatch-log-summary-grid">
      <div className="dispatch-log-summary-card">
        <span>Sayfadaki Kayıt</span>
        <strong>{summary.total}</strong>
      </div>

      <div className="dispatch-log-summary-card">
        <span>Tekli Taşıma</span>
        <strong>{summary.single}</strong>
      </div>

      <div className="dispatch-log-summary-card">
        <span>Toplu Taşıma</span>
        <strong>{summary.bulk}</strong>
      </div>

      <div className="dispatch-log-summary-card">
        <span>Güncelleme</span>
        <strong>{summary.update}</strong>
      </div>
    </div>
  );
}