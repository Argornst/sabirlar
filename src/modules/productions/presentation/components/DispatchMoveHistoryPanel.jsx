function formatHistoryDate(value) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

export function DispatchMoveHistoryPanel({
  entries = [],
  title = "Taşıma Geçmişi",
  description = "Son sürükle-bırak ve toplu taşıma işlemleri",
  onClear,
}) {
  return (
    <div className="production-card">
      <div className="production-card__header">
        <div>
          <h3 className="production-card__title">{title}</h3>
          <p className="production-card__subtitle">{description}</p>
        </div>

        {entries.length ? (
          <button
            type="button"
            className="dispatch-chip-button dispatch-chip-button--ghost"
            onClick={onClear}
          >
            Geçmişi Temizle
          </button>
        ) : null}
      </div>

      {!entries.length ? (
        <div className="production-empty-state">
          <h3>Henüz kayıt yok</h3>
          <p>Taşıma yaptıkça burada işlem özeti görünecek.</p>
        </div>
      ) : (
        <div className="dispatch-history-list">
          {entries.map((entry) => (
            <article key={entry.id} className="dispatch-history-item">
              <div className="dispatch-history-item__top">
                <strong>{entry.title}</strong>
                <span>{formatHistoryDate(entry.createdAt)}</span>
              </div>

              <p>{entry.message}</p>

              <div className="dispatch-history-item__meta">
                <span>Görünüm: {entry.view || "-"}</span>
                <span>Kayıt: {entry.count || 1}</span>
                <span>Hedef Tarih: {entry.toDate || "-"}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}