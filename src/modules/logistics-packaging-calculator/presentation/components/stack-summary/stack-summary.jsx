import './stack-summary.css';

function formatWeight(value) {
  return `${Number(value ?? 0).toFixed(3)} kg`;
}

function formatHeight(value) {
  return `${Number(value ?? 0).toFixed(2)} cm`;
}

export function StackSummary({ stacks }) {
  return (
    <div className="lp-panel">
      <div className="lp-section-heading">
        <div>
          <h3 className="lp-section-heading__title">İstif Özeti</h3>
          <p className="lp-section-heading__description">
            Aynı istif grubu içindeki paletlerin toplam yüksekliği, brüt ağırlığı ve
            zemindeki palet sayısı.
          </p>
        </div>
      </div>

      {!stacks.length ? (
        <div className="lp-empty-state">Henüz istif grubu tanımlanmadı.</div>
      ) : (
        <div className="lp-stack-summary-grid">
          {stacks.map((stack) => (
            <div key={stack.stackGroup} className="lp-stack-summary-card">
              <div className="lp-stack-summary-card__header">
                <h4>{stack.stackGroup}</h4>
                <span
                  className={`lp-stack-summary-card__badge ${
                    stack.exceedsStackHeightLimit ? 'is-warning' : 'is-valid'
                  }`}
                >
                  {stack.exceedsStackHeightLimit ? 'Limit Aşıldı' : 'Uygun'}
                </span>
              </div>

              <div className="lp-stack-summary-card__content">
                <div className="lp-stack-summary-card__row">
                  <span>Toplam Yükseklik</span>
                  <strong>{formatHeight(stack.totalHeightCm)}</strong>
                </div>
                <div className="lp-stack-summary-card__row">
                  <span>Toplam Brüt</span>
                  <strong>{formatWeight(stack.totalGrossWeightKg)}</strong>
                </div>
                <div className="lp-stack-summary-card__row">
                  <span>Zemindeki Palet</span>
                  <strong>{stack.groundPalletCount}</strong>
                </div>
                <div className="lp-stack-summary-card__row">
                  <span>Palet Satırları</span>
                  <strong>{stack.palletLineIds.length}</strong>
                </div>
              </div>

              <div className="lp-stack-summary-card__footer">
                <small>
                  İstif sırası: 1 = zemin, 2 = üst kat, 3 = bir üst kat
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}