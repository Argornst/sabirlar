const STATUS_LABELS = {
  hazirlaniyor: 'Hazırlanıyor',
  hazir: 'Hazır',
  sevk_planlandi: 'Sevk Planlandı',
  sevk_edildi: 'Sevk Edildi',
};

export function ProductionStatusBadge({ status }) {
  return (
    <span className={`production-status-badge production-status-badge--${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}