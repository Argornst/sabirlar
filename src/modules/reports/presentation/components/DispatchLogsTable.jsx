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

function formatDateTime(value) {
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

function formatDateRange(fromDate, toDate) {
  if (fromDate && toDate) {
    return `${fromDate} → ${toDate}`;
  }

  if (toDate) {
    return `Hedef tarih: ${toDate}`;
  }

  return "-";
}

export default function DispatchLogsTable({
  rows = [],
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 10,
  onPageChange,
}) {
  return (
    <div className="dispatch-log-table-wrap">
      <div className="dispatch-log-table-meta">
        <span>Toplam kayıt: {total}</span>
        <span>Sayfa boyutu: {pageSize}</span>
      </div>

      <div className="dispatch-log-table-scroll">
        <table className="dispatch-log-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Müşteri</th>
              <th>Ürün</th>
              <th>Lot</th>
              <th>İşlem</th>
              <th>Tarih Değişimi</th>
              <th>Yapan</th>
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.createdAt)}</td>
                  <td>{log.meta?.customer_name || "-"}</td>
                  <td>{log.meta?.product_name || "-"}</td>
                  <td>{log.meta?.lot_no || "-"}</td>
                  <td>{formatActionType(log.actionType)}</td>
                  <td>{formatDateRange(log.fromDate, log.toDate)}</td>
                  <td>{log.meta?.actor_name || "Bilinmeyen kullanıcı"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="dispatch-log-table__empty">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="dispatch-log-pagination">
        <button
          type="button"
          className="dispatch-chip-button dispatch-chip-button--ghost"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Önceki
        </button>

        <div className="dispatch-log-pagination__info">
          Sayfa {page} / {totalPages}
        </div>

        <button
          type="button"
          className="dispatch-chip-button dispatch-chip-button--ghost"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}