import { useDispatchLogsQuery } from "../hooks/useDispatchLogsQuery";

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

function formatActionType(actionType) {
  switch (actionType) {
    case "move":
      return "Tekli taşıma";
    case "bulk_move":
      return "Toplu taşıma";
    case "update":
      return "Kayıt güncelleme";
    default:
      return "İşlem";
  }
}

function formatDateRange(fromDate, toDate) {
  if (fromDate && toDate) {
    return `${fromDate} → ${toDate}`;
  }

  if (toDate) {
    return `Hedef tarih: ${toDate}`;
  }

  return "-";
}

export function DispatchMoveHistoryPanel() {
  const { data = [], isLoading, isError } = useDispatchLogsQuery();

  return (
    <div className="production-card">
      <div className="production-card__header">
        <div>
          <h3 className="production-card__title">Taşıma Geçmişi</h3>
          <p className="production-card__subtitle">
            Yapılan sürükle-bırak ve toplu taşıma işlemleri
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="production-empty-state">
          <h3>Yükleniyor</h3>
          <p>Geçmiş kayıtları getiriliyor.</p>
        </div>
      ) : isError ? (
        <div className="production-empty-state">
          <h3>Geçmiş yüklenemedi</h3>
          <p>Dispatch log kayıtları alınırken hata oluştu.</p>
        </div>
      ) : !data.length ? (
        <div className="production-empty-state">
          <h3>Kayıt yok</h3>
          <p>Henüz bir taşıma işlemi yapılmadı.</p>
        </div>
      ) : (
        <div className="dispatch-history-list">
          {data.map((log) => (
            <article key={log.id} className="dispatch-history-item">
              <div className="dispatch-history-item__top">
                <strong>{log.meta?.customer_name || "Müşteri yok"}</strong>
                <span>{formatHistoryDate(log.createdAt)}</span>
              </div>

              <p>
                {formatActionType(log.actionType)} •{" "}
                {formatDateRange(log.fromDate, log.toDate)}
              </p>

              <div className="dispatch-history-item__meta">
                <span>Ürün: {log.meta?.product_name || "-"}</span>
                <span>Lot: {log.meta?.lot_no || "-"}</span>
                <span>Kaynak: {log.meta?.source || "dispatch"}</span>
                <span>Yapan: {log.meta?.actor_name || "Bilinmeyen kullanıcı"}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}