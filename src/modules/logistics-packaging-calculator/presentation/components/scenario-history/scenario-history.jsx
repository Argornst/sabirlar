import { useState } from 'react';
import IconButton from '../../../../../shared/components/ui/IconButton';
import Input from '../../../../../shared/components/ui/Input';
import Select from '../../../../../shared/components/ui/Select';
import './scenario-history.css';

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function LoadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="lp-icon-button__icon" aria-hidden="true">
      <path
        d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="lp-icon-button__icon" aria-hidden="true">
      <rect
        x="9"
        y="9"
        width="11"
        height="11"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M15 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="lp-icon-button__icon" aria-hidden="true">
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon({ open = false }) {
  return (
    <svg viewBox="0 0 24 24" className="lp-icon-button__icon" aria-hidden="true">
      {open ? (
        <>
          <path
            d="M3 3l18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10.58 10.58A2 2 0 0 0 13.42 13.42"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M9.88 5.09A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8-0.51 1.44-1.3 2.74-2.3 3.82M6.1 6.1C3.89 7.61 2.18 9.67 1 12c1.73 4.89 6 8 11 8 1.61 0 3.15-0.32 4.55-0.91"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M1 12c1.73-4.89 6-8 11-8s9.27 3.11 11 8c-1.73 4.89-6 8-11 8S2.73 16.89 1 12z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </>
      )}
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="lp-icon-button__icon lp-icon-button__icon--spin" aria-hidden="true">
      <path
        d="M21 12a9 9 0 1 1-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ActionIconButton({
  label,
  icon,
  variant = 'ghost',
  onClick,
  disabled = false,
}) {
  return (
    <IconButton
      type="button"
      className={`lp-icon-button lp-icon-button--${variant}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      data-tooltip={label}
      title={label}
    >
      {icon}
    </IconButton>
  );
}

function ScenarioHistoryItem({
  item,
  productMap,
  materialMap,
  onLoadScenario,
  onDuplicateScenario,
  onDeleteScenario,
  deletingScenarioId,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const isDeleting = deletingScenarioId === item.scenario.id;
  const displayUpdatedAt =
    item.scenario.updatedAt ?? item.scenario.createdAt ?? null;

  return (
    <div className="lp-panel lp-scenario-history__card">
      <div className="lp-section-heading">
        <div>
          <h3 className="lp-section-heading__title">
            {item.scenario.name || 'İsimsiz Senaryo'}
          </h3>
          <p className="lp-section-heading__description">
            Oluşturma: {formatDate(item.scenario.createdAt)}
            {' · '}
            Son güncelleme: {formatDate(displayUpdatedAt)}
          </p>
        </div>

        <div className="lp-scenario-history__actions">
          <ActionIconButton
            label={isOpen ? 'Detayı kapat' : 'Detayı aç'}
            icon={<EyeIcon open={isOpen} />}
            variant="ghost"
            onClick={() => setIsOpen((prev) => !prev)}
            disabled={isDeleting}
          />

          <ActionIconButton
            label="Forma yükle"
            icon={<LoadIcon />}
            variant="ghost"
            onClick={() => onLoadScenario?.(item)}
            disabled={isDeleting}
          />

          <ActionIconButton
            label="Kopyala"
            icon={<CopyIcon />}
            variant="primary"
            onClick={() => onDuplicateScenario?.(item)}
            disabled={isDeleting}
          />

          <ActionIconButton
            label={isDeleting ? 'Siliniyor' : 'Sil'}
            icon={isDeleting ? <SpinnerIcon /> : <TrashIcon />}
            variant="danger"
            onClick={() => onDeleteScenario?.(item)}
            disabled={isDeleting}
          />
        </div>
      </div>

      {isOpen ? (
        <div className="lp-scenario-history__details">
          {item.lots.map((lotWrapper, index) => {
            const lot = lotWrapper.lot;
            const product = productMap.get(lot.productId);

            return (
              <div key={lot.id} className="lp-scenario-history-lot">
                <div className="lp-scenario-history-lot__header">
                  <strong>Lot {index + 1}</strong>
                  <span>{lot.lotNumber}</span>
                </div>

                <div className="lp-scenario-history-lot__grid">
                  <div>
                    Ürün:{' '}
                    {product ? `${product.code} - ${product.name}` : lot.productId}
                  </div>
                  <div>Miktar: {Number(lot.totalQuantityKg ?? 0).toFixed(3)} kg</div>
                  <div>
                    Ambalaj:{' '}
                    {materialMap.get(lot.containerMaterialId)
                      ? `${materialMap.get(lot.containerMaterialId).code} - ${materialMap.get(lot.containerMaterialId).name}`
                      : lot.containerMaterialId}
                  </div>
                  <div>
                    Vakum:{' '}
                    {lot.vacuumBagMaterialId
                      ? materialMap.get(lot.vacuumBagMaterialId)
                        ? `${materialMap.get(lot.vacuumBagMaterialId).code} - ${materialMap.get(lot.vacuumBagMaterialId).name}`
                        : lot.vacuumBagMaterialId
                      : '-'}
                  </div>
                </div>

                {lot.notes ? (
                  <div className="lp-scenario-history-lot__notes">
                    <strong>Not:</strong> <span>{lot.notes}</span>
                  </div>
                ) : null}

                <div className="lp-scenario-history-pallets">
                  {lotWrapper.palletLines.length === 0 ? (
                    <div className="lp-empty-state">Palet satırı yok.</div>
                  ) : (
                    lotWrapper.palletLines.map((line) => {
                      const palletMaterial = materialMap.get(line.palletMaterialId);

                      return (
                        <div key={line.id} className="lp-scenario-history-pallet">
                          <span>
                            Palet:{' '}
                            {palletMaterial
                              ? `${palletMaterial.code} - ${palletMaterial.name}`
                              : line.palletMaterialId}
                          </span>
                          <span>Adet: {line.palletCount}</span>
                          <span>Bir Sıra: {line.unitsPerRow}</span>
                          <span>Paletteki Toplam: {line.unitsPerPallet}</span>
                          <span>İstif: {line.stackGroup || '-'}</span>
                          <span>Sıra: {line.stackOrder}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="lp-scenario-history__collapsed">
          <span>{item.lots.length} lot</span>
          <span>Detay için göz ikonuna tıklayın</span>
        </div>
      )}
    </div>
  );
}

export function ScenarioHistory({
  scenarios = [],
  products = [],
  materials = [],
  search = '',
  sort = 'updated_desc',
  onSearchChange,
  onSortChange,
  onLoadScenario,
  onDuplicateScenario,
  onDeleteScenario,
  deletingScenarioId = null,
}) {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const materialMap = new Map(materials.map((material) => [material.id, material]));

  if (!scenarios.length) {
    return <div className="lp-empty-state">Henüz kayıt yok.</div>;
  }

  return (
    <div className="lp-scenario-history">
      <div className="lp-scenario-history__toolbar">
        <label className="lp-field">
          <span className="lp-field__label">Ara</span>
          <Input
            className="lp-input"
            type="text"
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Senaryo adı veya lot no"
          />
        </label>

        <label className="lp-field lp-scenario-history__sort">
          <span className="lp-field__label">Sırala</span>
          <Select
            className="lp-input"
            value={sort}
            onChange={(event) => onSortChange?.(event.target.value)}
          >
            <option value="updated_desc">Güncelden eskiye</option>
            <option value="updated_asc">Eskiden yeniye</option>
            <option value="name_asc">Ada göre A-Z</option>
            <option value="name_desc">Ada göre Z-A</option>
          </Select>
        </label>
      </div>

      {scenarios.map((item) => (
        <ScenarioHistoryItem
          key={item.scenario.id}
          item={item}
          productMap={productMap}
          materialMap={materialMap}
          onLoadScenario={onLoadScenario}
          onDuplicateScenario={onDuplicateScenario}
          onDeleteScenario={onDeleteScenario}
          deletingScenarioId={deletingScenarioId}
        />
      ))}
    </div>
  );
}