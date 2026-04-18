import './stack-summary.css';

function formatNumber(value, digits = 2) {
  if (value == null || Number.isNaN(Number(value))) return '-';

  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value));
}

export function StackSummary({ stackSummaries = [] }) {
  if (!stackSummaries.length) {
    return <div className="lp-empty-state">Henüz istif grubu tanımlanmadı.</div>;
  }

  return (
    <div className="lp-stack-summary">
      {stackSummaries.map((summary, index) => (
        <div
          key={summary.stackGroup ?? `stack-${index}`}
          className="lp-stack-summary__card"
        >
          <div className="lp-stack-summary__header">
            <div>
              <h4 className="lp-stack-summary__title">
                {summary.stackGroup || `İstif ${index + 1}`}
              </h4>
              <p className="lp-stack-summary__subtitle">
                Kat ve yükseklik özeti
              </p>
            </div>

            <span className="lp-stack-summary__badge">
              {(summary.items ?? []).length} kat
            </span>
          </div>

          <div className="lp-stack-summary__metrics">
            <div className="lp-stack-summary__metric">
              <span>Toplam Palet</span>
              <strong>{summary.palletCount ?? summary.palletTotal ?? 0}</strong>
            </div>

            <div className="lp-stack-summary__metric">
              <span>Toplam Yükseklik</span>
              <strong>{formatNumber(summary.totalHeightCm)} cm</strong>
            </div>
          </div>

          <div className="lp-stack-summary__layers">
            {(summary.items ?? []).map((item, itemIndex) => (
              <div
                key={item.palletLineId ?? `${summary.stackGroup}-${itemIndex}`}
                className="lp-stack-summary__layer"
              >
                <span>{item.stackOrder}. Kat</span>
                <strong>{item.palletCount ?? 0} palet</strong>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}