import './calculation-result-cards.css';

function getStatusClass(status) {
  if (status === 'VALID') return 'is-valid';
  if (status === 'WARNING') return 'is-warning';
  return 'is-invalid';
}

function translateValidationStatus(status) {
  if (status === 'VALID') return 'Uygun';
  if (status === 'WARNING') return 'Uyarılı';
  if (status === 'INVALID') return 'Hatalı';
  return status ?? '-';
}

export function CalculationResultCards({ items, status }) {
  return (
    <div className="lp-result-cards">
      {items.map((item) => (
        <div key={item.label} className="lp-result-card">
          <div className="lp-result-card__label">{item.label}</div>
          <div className="lp-result-card__value">{item.value}</div>
        </div>
      ))}

      <div className={`lp-result-card lp-result-card--status ${getStatusClass(status)}`}>
        <div className="lp-result-card__label">Doğrulama</div>
        <div className="lp-result-card__value">
          {translateValidationStatus(status)}
        </div>
      </div>
    </div>
  );
}