import './scenario-lot-sidebar.css';

function formatNumber(value, digits = 3) {
  if (value == null || Number.isNaN(Number(value))) {
    return '-';
  }

  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value));
}

function getStatusLabel(status) {
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

export function ScenarioLotSidebar({
  lots = [],
  products = [],
  selectedLotId,
  lotResultsMap,
  onSelectLot,
  onAddLot,
  onRemoveLot,
  onMoveLotUp,
  onMoveLotDown,
  hideInternalHeader = false,
}) {
  return (
    <section className="lp-lot-sidebar">
      {!hideInternalHeader ? (
        <div className="lp-lot-sidebar__header">
          <div>
            <h3 className="lp-lot-sidebar__title">Lotlar</h3>
            <p className="lp-lot-sidebar__description">
              Lotlar arasında hızlıca geçiş yapın ve tek seferde yalnızca seçili lotu düzenleyin.
            </p>
          </div>

          <button type="button" className="lp-button" onClick={onAddLot}>
            ✚ Yeni Lot
          </button>
        </div>
      ) : null}

      <div className="lp-lot-sidebar__list">
        {lots.map((lot, index) => {
          const isSelected = lot.id === selectedLotId;
          const result = lotResultsMap?.get(lot.id);
          const product = products.find((item) => item.id === lot.values.productId);

          return (
            <div
              key={lot.id}
              className={`lp-lot-sidebar__item ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelectLot(lot.id)}
              role="button"
              tabIndex={0}
            >
              <div className="lp-lot-sidebar__item-top">
                <div className="lp-lot-sidebar__identity">
                  <span className="lp-lot-sidebar__index">#{index + 1}</span>

                  <div className="lp-lot-sidebar__labels">
                    <strong className="lp-lot-sidebar__lot-number">
                      {lot.values.lotNumber?.trim() || `Lot ${index + 1}`}
                    </strong>
                    <span className="lp-lot-sidebar__product">
                      {product ? `${product.code} - ${product.name}` : 'Ürün seçilmedi'}
                    </span>
                  </div>
                </div>

                <span
                  className={`lp-lot-sidebar__status ${getStatusClass(
                    result?.validationStatus,
                  )}`}
                >
                  {getStatusLabel(result?.validationStatus)}
                </span>
              </div>

              <div className="lp-lot-sidebar__metrics">
                <div className="lp-lot-sidebar__metric">
                  <span>Net</span>
                  <strong>{formatNumber(result?.totalNetWeightKg)} kg</strong>
                </div>

                <div className="lp-lot-sidebar__metric">
                  <span>Brüt</span>
                  <strong>{formatNumber(result?.totalGrossWeightKg)} kg</strong>
                </div>

                <div className="lp-lot-sidebar__metric">
                  <span>Palet</span>
                  <strong>{result?.totalPalletCount ?? 0}</strong>
                </div>
              </div>

              <div className="lp-lot-sidebar__meta">
                <span>İstif: {result?.stackSummaries?.length ?? 0}</span>
                <span>Uyarı: {(result?.validationMessages ?? []).filter((m) => m.level === 'WARNING').length}</span>
                <span>Hata: {(result?.validationMessages ?? []).filter((m) => m.level === 'ERROR').length}</span>
              </div>

              <div className="lp-lot-sidebar__actions">
                <button
                  type="button"
                  className="lp-lot-sidebar__action-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMoveLotUp(lot.id);
                  }}
                  disabled={index === 0}
                  title="Yukarı taşı"
                >
                  ↑
                </button>

                <button
                  type="button"
                  className="lp-lot-sidebar__action-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMoveLotDown(lot.id);
                  }}
                  disabled={index === lots.length - 1}
                  title="Aşağı taşı"
                >
                  ↓
                </button>

                <button
                  type="button"
                  className="lp-lot-sidebar__action-button is-danger"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveLot(lot.id);
                  }}
                  disabled={lots.length <= 1}
                  title="Sil"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}