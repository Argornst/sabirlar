import { useMemo, useState } from 'react';
import './scenario-history.css';

function formatDateTime(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getProductLabel(productId, products = []) {
  const product = products.find((item) => item.id === productId);
  if (!product) return '-';
  return `${product.code} - ${product.name}`;
}

function getMaterialLabel(materialId, materials = []) {
  if (!materialId) return '-';

  const material = materials.find((item) => item.id === materialId);
  if (!material) return '-';

  return `${material.code} - ${material.name}`;
}

export function ScenarioHistory({
  scenarios = [],
  products = [],
  materials = [],
  search,
  sort,
  onSearchChange,
  onSortChange,
  onLoadScenario,
  onDuplicateScenario,
  onDeleteScenario,
  deletingScenarioId,
}) {
  const [expandedScenarioIds, setExpandedScenarioIds] = useState([]);

  const toggleExpanded = (scenarioId) => {
    setExpandedScenarioIds((current) =>
      current.includes(scenarioId)
        ? current.filter((id) => id !== scenarioId)
        : [...current, scenarioId],
    );
  };

  const normalizedDeletingId = useMemo(
    () => String(deletingScenarioId ?? ''),
    [deletingScenarioId],
  );

  return (
    <div className="lp-scenario-history">
      <div className="lp-scenario-history__toolbar">
        <label className="lp-field">
          <span className="lp-field__label">Ara</span>
          <input
            className="lp-input"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Senaryo adı veya lot no"
          />
        </label>

        <label className="lp-field lp-scenario-history__sort">
          <span className="lp-field__label">Sırala</span>
          <select
            className="lp-input"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
          >
            <option value="updated_desc">Güncelden eskiye</option>
            <option value="updated_asc">Eskiden yeniye</option>
            <option value="name_asc">Ada göre A-Z</option>
            <option value="name_desc">Ada göre Z-A</option>
          </select>
        </label>
      </div>

      <div className="lp-scenario-history__list">
        {scenarios.length === 0 ? (
          <div className="lp-empty-state">Kaydedilmiş senaryo bulunamadı.</div>
        ) : null}

        {scenarios.map((record) => {
          const scenarioId = record.scenario.id;
          const isExpanded = expandedScenarioIds.includes(scenarioId);
          const isDeleting = normalizedDeletingId === String(scenarioId);

          return (
            <div key={scenarioId} className="lp-history-card">
              <div className="lp-history-card__header">
                <div>
                  <h4 className="lp-history-card__title">
                    {record.scenario.name || 'Adsız Senaryo'}
                  </h4>

                  <p className="lp-history-card__meta">
                    Oluşturma: {formatDateTime(record.scenario.createdAt)} · Son güncelleme:{' '}
                    {formatDateTime(record.scenario.updatedAt)}
                  </p>
                </div>

                <div className="lp-history-card__actions">
                  <button
                    type="button"
                    className="lp-button lp-button--ghost"
                    onClick={() => toggleExpanded(scenarioId)}
                  >
                    {isExpanded ? 'Detayı Gizle' : 'Detay'}
                  </button>

                  <button
                    type="button"
                    className="lp-button lp-button--ghost"
                    onClick={() => onLoadScenario(record)}
                  >
                    ⤓
                  </button>

                  <button
                    type="button"
                    className="lp-button lp-button--ghost"
                    onClick={() => onDuplicateScenario(record)}
                  >
                    ⧉
                  </button>

                  <button
                    type="button"
                    className="lp-button lp-button--ghost is-danger"
                    onClick={() => onDeleteScenario(scenarioId)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? '…' : '🗑'}
                  </button>
                </div>
              </div>

              {isExpanded ? (
                <div className="lp-history-card__details">
                  {(record.lots ?? []).map((lotItem, index) => {
                    const lot = lotItem.lot;
                    const palletLines = lotItem.palletLines ?? [];

                    return (
                      <div key={lot.id} className="lp-history-lot">
                        <div className="lp-history-lot__top">
                          <strong>Lot {index + 1}</strong>
                          <span>{lot.lotNumber || '-'}</span>
                        </div>

                        <div className="lp-history-lot__grid">
                          <div>
                            <span>Ürün</span>
                            <strong>{getProductLabel(lot.productId, products)}</strong>
                          </div>

                          <div>
                            <span>Miktar</span>
                            <strong>{lot.totalQuantityKg ?? 0} kg</strong>
                          </div>

                          <div>
                            <span>Ambalaj</span>
                            <strong>
                              {getMaterialLabel(lot.containerMaterialId, materials)}
                            </strong>
                          </div>

                          <div>
                            <span>Vakum</span>
                            <strong>
                              {getMaterialLabel(lot.vacuumBagMaterialId, materials)}
                            </strong>
                          </div>
                        </div>

                        <div className="lp-history-lot__pallet-lines">
                          {palletLines.map((line) => (
                            <div key={line.id} className="lp-history-lot__pallet-line">
                              <span>
                                Palet: {getMaterialLabel(line.palletMaterialId, materials)}
                              </span>
                              <span>Adet: {line.palletCount}</span>
                              <span>Bir Sıra: {line.unitsPerRow}</span>
                              <span>Paletteki Toplam: {line.unitsPerPallet}</span>
                              <span>İstif: {line.stackGroup || 'Yok'}</span>
                              <span>Sıra: {line.stackOrder || 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}