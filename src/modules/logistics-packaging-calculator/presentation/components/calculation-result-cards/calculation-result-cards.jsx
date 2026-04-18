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

function formatNumber(value, fractionDigits = 3) {
  if (value == null || Number.isNaN(Number(value))) {
    return '-';
  }

  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(value));
}

function buildItemsFromResult(result) {
  if (!result) {
    return [];
  }

  return [
    { label: 'Toplam Net', value: `${formatNumber(result.totalNetWeightKg)} kg` },
    { label: 'Toplam Dara', value: `${formatNumber(result.totalTareWeightKg)} kg` },
    { label: 'Toplam Brüt', value: `${formatNumber(result.totalGrossWeightKg)} kg` },
    { label: 'Toplam Ambalaj', value: `${result.totalContainerCount ?? 0}` },
    { label: 'Toplam Palet', value: `${result.totalPalletCount ?? 0}` },
    { label: 'Zemindeki Palet', value: `${result.totalGroundPalletCount ?? 0}` },
  ];
}

export function CalculationResultCards({
  items,
  status,
  result,
}) {
  const resolvedItems =
    Array.isArray(items) && items.length > 0
      ? items
      : buildItemsFromResult(result);

  const resolvedStatus = status ?? result?.validationStatus;

  return (
    <div className="lp-result-cards">
      {resolvedItems.map((item) => (
        <div key={item.label} className="lp-result-card">
          <div className="lp-result-card__label">{item.label}</div>
          <div className="lp-result-card__value">{item.value}</div>
        </div>
      ))}

      <div
        className={`lp-result-card lp-result-card--status ${getStatusClass(
          resolvedStatus,
        )}`}
      >
        <div className="lp-result-card__label">Doğrulama</div>
        <div className="lp-result-card__value">
          {translateValidationStatus(resolvedStatus)}
        </div>
      </div>
    </div>
  );
}