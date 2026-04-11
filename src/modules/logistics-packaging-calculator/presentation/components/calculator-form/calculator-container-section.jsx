function preventWheelChange(event) {
  event.currentTarget.blur();
}

export function CalculatorContainerSection({
  values,
  containerOptions,
  vacuumBagOptions,
  onChange,
}) {
  return (
    <div className="lp-panel">
      <div className="lp-section-heading">
        <div>
          <h3 className="lp-section-heading__title">Ambalaj Bilgisi</h3>
          <p className="lp-section-heading__description">
            Kutu / varil ve opsiyonel vakum torbası seçin.
          </p>
        </div>
      </div>

      <div className="lp-form-grid lp-form-grid--4">
        <label className="lp-field">
          <span className="lp-field__label">Taşıyıcı Ambalaj</span>
          <select
            className="lp-input"
            value={values.containerMaterialId}
            onChange={(event) => onChange({ containerMaterialId: event.target.value })}
          >
            <option value="">Ambalaj seçin</option>
            {containerOptions.map((material) => (
              <option key={material.id} value={material.id}>
                {material.code} - {material.name}
              </option>
            ))}
          </select>
        </label>

        <label className="lp-field">
          <span className="lp-field__label">Vakum Torbası</span>
          <select
            className="lp-input"
            value={values.vacuumBagMaterialId ?? ''}
            onChange={(event) =>
              onChange({
                vacuumBagMaterialId: event.target.value || null,
              })
            }
          >
            <option value="">Yok</option>
            {vacuumBagOptions.map((material) => (
              <option key={material.id} value={material.id}>
                {material.code} - {material.name}
              </option>
            ))}
          </select>
        </label>

        <label className="lp-field">
          <span className="lp-field__label">Birim Net Ağırlık (kg)</span>
          <input
            className="lp-input"
            type="number"
            min="0"
            step="0.001"
            value={values.unitNetWeightKg}
            onWheel={preventWheelChange}
            onChange={(event) =>
              onChange({
                unitNetWeightKg: event.target.value === '' ? '' : Number(event.target.value),
              })
            }
          />
        </label>

        <label className="lp-field">
          <span className="lp-field__label">Not</span>
          <input
            className="lp-input"
            type="text"
            value={values.notes}
            onChange={(event) => onChange({ notes: event.target.value })}
            placeholder="Opsiyonel not"
          />
        </label>
      </div>
    </div>
  );
}