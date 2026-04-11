import './pallet-line-editor.css';

function toNumberOrEmpty(value) {
  if (value === '') return '';
  return Number(value);
}

function preventWheelChange(event) {
  event.currentTarget.blur();
}

const STACK_ORDER_OPTIONS = [1, 2, 3, 4, 5, 6];
const NEW_STACK_GROUP_VALUE = '__NEW_STACK_GROUP__';

export function PalletLineEditor({
  line,
  palletOptions,
  lineResult,
  stackGroupOptions,
  onChange,
  onRemove,
  disableRemove,
}) {
  const selectedStackValue = line.stackGroup || '';

  return (
    <div className="lp-pallet-line">
      <div className="lp-pallet-line__grid">
        <label className="lp-field">
          <span className="lp-field__label">Palet Tipi</span>
          <select
            className="lp-input"
            value={line.palletMaterialId}
            onChange={(event) =>
              onChange(line.id, {
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
            value={line.palletCount}
            onWheel={preventWheelChange}
            onChange={(event) =>
              onChange(line.id, {
                palletCount: toNumberOrEmpty(event.target.value),
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
            value={line.unitsPerRow}
            onWheel={preventWheelChange}
            onChange={(event) =>
              onChange(line.id, {
                unitsPerRow: toNumberOrEmpty(event.target.value),
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
            value={line.unitsPerPallet}
            onWheel={preventWheelChange}
            onChange={(event) =>
              onChange(line.id, {
                unitsPerPallet: toNumberOrEmpty(event.target.value),
              })
            }
          />
        </label>

        <label className="lp-field">
          <span className="lp-field__label">İstif Grubu</span>
          <select
            className="lp-input"
            value={selectedStackValue}
            onChange={(event) => {
              const nextValue = event.target.value;

              if (nextValue === NEW_STACK_GROUP_VALUE) {
                onChange(line.id, {
                  createNextStackGroup: true,
                });
                return;
              }

              onChange(line.id, {
                stackGroup: nextValue,
              });
            }}
          >
            <option value="">İstif yok</option>
            {stackGroupOptions.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
            <option value={NEW_STACK_GROUP_VALUE}>+ Yeni istif oluştur</option>
          </select>
        </label>

        <label className="lp-field">
          <span className="lp-field__label">İstif Sırası</span>
          <select
            className="lp-input"
            value={line.stackOrder === '' ? 1 : line.stackOrder}
            onChange={(event) =>
              onChange(line.id, {
                stackOrder: Number(event.target.value),
              })
            }
          >
            {STACK_ORDER_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}. Kat
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="lp-pallet-line__footer">
        <div className="lp-pallet-line__stats">
          <div className="lp-inline-stat">
            <span>Palet Başına Sıra</span>
            <strong>{lineResult ? lineResult.rowCount : '-'}</strong>
          </div>
          <div className="lp-inline-stat">
            <span>Palet Yüksekliği</span>
            <strong>{lineResult ? `${lineResult.palletHeightCm.toFixed(2)} cm` : '-'}</strong>
          </div>
          <div className="lp-inline-stat">
            <span>Palet Brüt</span>
            <strong>{lineResult ? `${lineResult.palletGrossWeightKg.toFixed(3)} kg` : '-'}</strong>
          </div>
          <div className="lp-inline-stat">
            <span>Satır Toplam Brüt</span>
            <strong>
              {lineResult ? `${lineResult.totalLineGrossWeightKg.toFixed(3)} kg` : '-'}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="lp-button lp-button--ghost"
          onClick={() => onRemove(line.id)}
          disabled={disableRemove}
        >
          Satırı Sil
        </button>
      </div>
    </div>
  );
}