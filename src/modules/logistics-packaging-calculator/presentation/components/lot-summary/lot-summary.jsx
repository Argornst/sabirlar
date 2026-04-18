import './lot-summary.css';

function formatNumber(value, fractionDigits = 2) {
  if (value == null) return '-';

  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function translateValidationStatus(status) {
  if (status === 'VALID') return 'Uygun';
  if (status === 'WARNING') return 'Uyarılı';
  if (status === 'INVALID') return 'Hatalı';
  return status ?? '-';
}

function getStatusClass(status) {
  if (status === 'VALID') return 'is-valid';
  if (status === 'WARNING') return 'is-warning';
  return 'is-invalid';
}

function getMessageCounts(messages = []) {
  return messages.reduce(
    (acc, message) => {
      if (message.level === 'ERROR') {
        acc.errorCount += 1;
      } else if (message.level === 'WARNING') {
        acc.warningCount += 1;
      }

      return acc;
    },
    {
      errorCount: 0,
      warningCount: 0,
    },
  );
}

export function LotSummary({ values, result, products = [] }) {
  if (!values) {
    return null;
  }

  const product = products.find((p) => p.id === values?.productId);
  const stackCount = result?.stackSummaries?.length ?? 0;
  const { errorCount, warningCount } = getMessageCounts(
    result?.validationMessages ?? [],
  );

  return (
    <div className="lp-lot-summary">
      <div className="lp-lot-summary__left">
        <div className="lp-lot-summary__topline">
          <div className="lp-lot-summary__title">
            {product
              ? `${product.code} - ${product.name}`
              : values?.productId || 'Ürün seçilmedi'}
          </div>

          <span
            className={`lp-lot-summary__status ${getStatusClass(
              result?.validationStatus,
            )}`}
          >
            {translateValidationStatus(result?.validationStatus)}
          </span>
        </div>

        <div className="lp-lot-summary__meta">
          <span>Lot: {values?.lotNumber || '-'}</span>
          <span>İstif: {stackCount}</span>
          <span>Hata: {errorCount}</span>
          <span>Uyarı: {warningCount}</span>
        </div>
      </div>

      <div className="lp-lot-summary__right">
        <div className="lp-lot-summary__metric">
          <span>Net</span>
          <strong>{formatNumber(result?.totalNetWeightKg)} kg</strong>
        </div>

        <div className="lp-lot-summary__metric">
          <span>Brüt</span>
          <strong>{formatNumber(result?.totalGrossWeightKg)} kg</strong>
        </div>

        <div className="lp-lot-summary__metric">
          <span>Palet</span>
          <strong>{result?.totalPalletCount ?? 0}</strong>
        </div>
      </div>
    </div>
  );
}