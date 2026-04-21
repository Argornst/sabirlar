import Button from '../../../../../shared/components/ui/Button';
import './scenario-lot-tabs.css';

function getStatusLabel(status) {
  if (status === 'VALID') return 'Uygun';
  if (status === 'WARNING') return 'Uyarılı';
  if (status === 'INVALID') return 'Hatalı';
  return status || '-';
}

export function ScenarioLotTabs({
  lots,
  activeLotId,
  getLotResult,
  onSelectLot,
  onAddLot,
  onRemoveLot,
  onMoveLotUp,
  onMoveLotDown,
}) {
  return (
    <section className="scenario-lot-tabs">
      <div className="scenario-lot-tabs__header">
        <div>
          <h3>Lotlar</h3>
          <p>Bir lot seç ve detaylarını sağ panelde düzenle.</p>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="scenario-lot-tabs__add-button"
          onClick={onAddLot}
        >
          + Lot Ekle
        </Button>
      </div>

      <div className="scenario-lot-tabs__grid">
        {lots.map((lot, index) => {
          const result = getLotResult(lot.id);
          const isActive = lot.id === activeLotId;
          const lotNumber = lot.values.lotNumber?.trim() || `Lot ${index + 1}`;

          return (
            <article
              key={lot.id}
              className={`scenario-lot-tab-card ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectLot(lot.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectLot(lot.id);
                }
              }}
            >
              <div className="scenario-lot-tab-card__top">
                <div>
                  <div className="scenario-lot-tab-card__title">{lotNumber}</div>
                  <div className="scenario-lot-tab-card__subtitle">
                    {lot.values.productId || 'Ürün seçilmedi'}
                  </div>
                </div>

                <span
                  className={`scenario-lot-tab-card__badge status-${String(
                    result.validationStatus || '',
                  ).toLowerCase()}`}
                >
                  {getStatusLabel(result.validationStatus)}
                </span>
              </div>

              <div className="scenario-lot-tab-card__stats">
                <div>
                  <span>Brüt</span>
                  <strong>{result.totalGrossWeightKg.toFixed(3)} kg</strong>
                </div>
                <div>
                  <span>Palet</span>
                  <strong>{result.totalPalletCount}</strong>
                </div>
                <div>
                  <span>Ambalaj</span>
                  <strong>{result.totalContainerCount}</strong>
                </div>
              </div>

              <div className="scenario-lot-tab-card__actions">
                <Button
                  type="button"
          variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMoveLotUp(lot.id);
                  }}
                >
                  ↑
                </Button>

                <Button
                  type="button"
          variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMoveLotDown(lot.id);
                  }}
                >
                  ↓
                </Button>

                <Button
                  type="button"
          variant="ghost"
                  className="danger"
                  disabled={lots.length === 1}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveLot(lot.id);
                  }}
                >
                  Sil
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}