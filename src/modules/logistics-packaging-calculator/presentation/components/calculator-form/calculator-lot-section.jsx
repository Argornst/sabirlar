function preventWheelChange(event) {
  event.currentTarget.blur();
}

export function CalculatorLotSection({ values, products, onChange }) {
  return (
    <div className="lp-panel">
      <div className="lp-section-heading">
        <div>
          <h3 className="lp-section-heading__title">Lot Bilgisi</h3>
          <p className="lp-section-heading__description">
            Lot numarası, ürün ve toplam miktarı girin.
          </p>
        </div>
      </div>

      <div className="lp-form-grid lp-form-grid--3">
        <label className="lp-field">
          <span className="lp-field__label">Lot Numarası</span>
          <input
            className="lp-input"
            type="text"
            value={values.lotNumber}
            onChange={(event) => onChange({ lotNumber: event.target.value })}
            placeholder="Örn: LT-2026-001"
          />
        </label>

        <label className="lp-field">
          <span className="lp-field__label">Ürün</span>
          <select
            className="lp-input"
            value={values.productId}
            onChange={(event) => onChange({ productId: event.target.value })}
          >
            <option value="">Ürün seçin</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.code} - {product.name}
              </option>
            ))}
          </select>
        </label>

        <label className="lp-field">
          <span className="lp-field__label">Toplam Miktar (kg)</span>
          <input
            className="lp-input"
            type="number"
            min="0"
            step="0.001"
            value={values.totalQuantityKg}
            onWheel={preventWheelChange}
            onChange={(event) =>
              onChange({
                totalQuantityKg: event.target.value === '' ? '' : Number(event.target.value),
              })
            }
          />
        </label>
      </div>
    </div>
  );
}