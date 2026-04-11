import './calculator-summary-section.css';

function translateValidationStatus(status) {
  if (status === 'VALID') return 'Uygun';
  if (status === 'WARNING') return 'Uyarılı';
  if (status === 'INVALID') return 'Hatalı';
  return status ?? '-';
}

function translateMessageLevel(level) {
  if (level === 'ERROR') return 'Hata';
  if (level === 'WARNING') return 'Uyarı';
  if (level === 'INFO') return 'Bilgi';
  return level ?? '-';
}

export function CalculatorSummarySection({ summaryItems, result }) {
  const messages = result.validationMessages ?? [];

  return (
    <div className="lp-panel">
      <div className="lp-section-heading">
        <div>
          <h3 className="lp-section-heading__title">Genel Özet</h3>
          <p className="lp-section-heading__description">
            Sistem net, dara, brüt ve validasyon durumunu gerçek zamanlı hesaplar.
          </p>
        </div>
      </div>

      <div className="lp-summary-grid">
        {summaryItems.map((item) => (
          <div key={item.label} className="lp-summary-card">
            <span className="lp-summary-card__label">{item.label}</span>
            <strong className="lp-summary-card__value">{item.value}</strong>
          </div>
        ))}

        <div className="lp-summary-card">
          <span className="lp-summary-card__label">Doğrulama</span>
          <strong className="lp-summary-card__value">
            {translateValidationStatus(result.validationStatus)}
          </strong>
        </div>
      </div>

      {messages.length > 0 ? (
        <div className="lp-summary-messages">
          {messages.map((message, index) => (
            <div
              key={`${message.code}-${index}`}
              className={`lp-summary-message lp-summary-message--${String(
                message.level || '',
              ).toLowerCase()}`}
            >
              <strong>{translateMessageLevel(message.level)}</strong>
              <span>{message.message}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}