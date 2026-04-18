import { useState } from 'react';
import './calculator-form.css';

function normalizeNumberInput(value) {
  if (value === '' || value == null) {
    return '';
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : '';
}

export function CalculatorPalletLinesSection({
  lines = [],
  palletOptions = [],
  stackGroupOptions = [],
  validationMap,
  onAddLine,
  onRemoveLine,
  onChangeLine,
}) {
  const [openLineIds, setOpenLineIds] = useState(() =>
    lines.length > 0 ? [lines[0].id] : [],
  );

  const safeStackGroupOptions = Array.isArray(stackGroupOptions)
    ? stackGroupOptions
    : [];

  const safeValidationMap = validationMap ?? {
    palletLineIds: new Set(),
    stackGroups: new Set(),
    hasGeneralError: false,
  };

  const toggleLine = (lineId) => {
    setOpenLineIds((current) =>
      current.includes(lineId)
        ? current.filter((id) => id !== lineId)
        : [...current, lineId],
    );
  };

  return (
    <div className="lp-form-section lp-pallet-plan">
      <div className="lp-form-section__header lp-pallet-plan__header">
        <div>
          <h3 className="lp-form-section__title">Palet Planı</h3>
          <p className="lp-form-section__description">
            Palet tipi, adet, sıradaki adet, paletteki toplam ambalaj ve istif bilgilerini girin.
          </p>
        </div>

        <button
          type="button"
          className="lp-button"
          onClick={() => onAddLine?.()}
        >
          + Palet Satırı Ekle
        </button>
      </div>

      <div className="lp-pallet-plan__list">
        {lines.length === 0 ? (
          <div className="lp-empty-state">Henüz palet satırı eklenmedi.</div>
        ) : null}

        {lines.map((line, index) => {
          const hasLineError = safeValidationMap.palletLineIds?.has?.(line.id);
          const isOpen = openLineIds.includes(line.id);

          const selectedStackGroup = String(line.stackGroup ?? '').trim();
          const isKnownStackGroup = safeStackGroupOptions.find(
            (group) => String(group ?? '').trim() === selectedStackGroup,
          );

          const selectedPallet = palletOptions.find(
            (option) => option.id === line.palletMaterialId,
          );

          return (
            <div
              key={line.id}
              className={`lp-pallet-line-card ${hasLineError ? 'has-error' : ''}`}
            >
              <div className="lp-pallet-line-card__top">
                <button
                  type="button"
                  className="lp-pallet-line-card__summary"
                  onClick={() => toggleLine(line.id)}
                >
                  <div className="lp-pallet-line-card__title-wrap">
                    <div className="lp-pallet-line-card__index">#{index + 1}</div>

                    <div>
                      <div className="lp-pallet-line-card__title">Palet Satırı</div>
                      <div className="lp-pallet-line-card__subtitle">
                        {selectedPallet
                          ? `${selectedPallet.code} - ${selectedPallet.name}`
                          : 'Palet tipi seçilmedi'}
                      </div>
                    </div>
                  </div>

                  <div className="lp-pallet-line-card__summary-metrics">
                    <div className="lp-pallet-line-card__mini-chip">
                      <span>Palet</span>
                      <strong>{line.palletCount || 0}</strong>
                    </div>

                    <div className="lp-pallet-line-card__mini-chip">
                      <span>Sıra</span>
                      <strong>{line.unitsPerRow || '-'}</strong>
                    </div>

                    <div className="lp-pallet-line-card__mini-chip">
                      <span>Toplam</span>
                      <strong>{line.unitsPerPallet || '-'}</strong>
                    </div>

                    <div className="lp-pallet-line-card__mini-chip">
                      <span>İstif</span>
                      <strong>{selectedStackGroup || 'Yok'}</strong>
                    </div>

                    <div className="lp-pallet-line-card__chevron">
                      {isOpen ? '▾' : '▸'}
                    </div>
                  </div>
                </button>

                <div className="lp-pallet-line-card__actions">
                  <button
                    type="button"
                    className="lp-button lp-button--ghost"
                    onClick={() =>
                      onChangeLine?.(line.id, {
                        createNextStackGroup: true,
                      })
                    }
                  >
                    + İstif Grubu
                  </button>

                  <button
                    type="button"
                    className="lp-button lp-button--ghost"
                    onClick={() => onRemoveLine?.(line.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>

              {isOpen ? (
                <>
                  <div className="lp-pallet-line-card__grid">
                    <label className="lp-field">
                      <span className="lp-field__label">Palet Tipi</span>
                      <select
                        className="lp-input"
                        value={line.palletMaterialId ?? ''}
                        onChange={(event) =>
                          onChangeLine?.(line.id, {
                            palletMaterialId: event.target.value,
                          })
                        }
                      >
                        <option value="">Palet seçin</option>
                        {palletOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.code} - {option.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="lp-field">
                      <span className="lp-field__label">Palet Adedi</span>
                      <input
                        className="lp-input"
                        type="number"
                        min="1"
                        value={line.palletCount ?? ''}
                        onChange={(event) =>
                          onChangeLine?.(line.id, {
                            palletCount: normalizeNumberInput(event.target.value),
                          })
                        }
                      />
                    </label>

                    <label className="lp-field">
                      <span className="lp-field__label">Bir Sıradaki Adet</span>
                      <input
                        className="lp-input"
                        type="number"
                        min="1"
                        value={line.unitsPerRow ?? ''}
                        onChange={(event) =>
                          onChangeLine?.(line.id, {
                            unitsPerRow: normalizeNumberInput(event.target.value),
                          })
                        }
                      />
                    </label>

                    <label className="lp-field">
                      <span className="lp-field__label">Paletteki Toplam Ambalaj</span>
                      <input
                        className="lp-input"
                        type="number"
                        min="1"
                        value={line.unitsPerPallet ?? ''}
                        onChange={(event) =>
                          onChangeLine?.(line.id, {
                            unitsPerPallet: normalizeNumberInput(event.target.value),
                          })
                        }
                      />
                    </label>

                    <label className="lp-field">
                      <span className="lp-field__label">İstif Grubu</span>
                      <select
                        className="lp-input"
                        value={line.stackGroup ?? ''}
                        onChange={(event) =>
                          onChangeLine?.(line.id, {
                            stackGroup: event.target.value,
                          })
                        }
                      >
                        <option value="">İstif yok</option>
                        {safeStackGroupOptions.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="lp-field">
                      <span className="lp-field__label">İstif Sırası</span>
                      <select
                        className="lp-input"
                        value={line.stackOrder ?? 1}
                        onChange={(event) =>
                          onChangeLine?.(line.id, {
                            stackOrder: normalizeNumberInput(event.target.value) || 1,
                          })
                        }
                      >
                        <option value={1}>1. Kat</option>
                        <option value={2}>2. Kat</option>
                        <option value={3}>3. Kat</option>
                      </select>
                    </label>
                  </div>

                  <div className="lp-pallet-line-card__meta">
                    <div className="lp-pallet-line-card__chip">
                      <span>Grup</span>
                      <strong>
                        {selectedStackGroup
                          ? isKnownStackGroup
                            ? selectedStackGroup
                            : `${selectedStackGroup} (yeni)`
                          : 'İstif yok'}
                      </strong>
                    </div>

                    <div className="lp-pallet-line-card__chip">
                      <span>Kat</span>
                      <strong>{line.stackOrder ?? 1}. Kat</strong>
                    </div>

                    <div className="lp-pallet-line-card__chip">
                      <span>Toplam</span>
                      <strong>{line.unitsPerPallet || '-'} ambalaj</strong>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}