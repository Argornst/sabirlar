import {
  PRODUCTION_STATUSES,
  QUANTITY_UNITS,
  createEmptyProductionForm,
} from "../../domain/entities/production.entity";

const STATUS_LABELS = {
  hazirlaniyor: "Hazırlanıyor",
  hazir: "Hazır",
  sevk_planlandi: "Sevk Planlandı",
  sevk_edildi: "Sevk Edildi",
};

export function ProductionForm({
  initialValues = createEmptyProductionForm(),
  errors = {},
  loading = false,
  submitLabel = "Kaydet",
  onSubmit,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const values = {
      lot_no: formData.get("lot_no"),
      customer_name: formData.get("customer_name"),
      product_name: formData.get("product_name"),
      quantity: formData.get("quantity"),
      quantity_unit: formData.get("quantity_unit"),
      packaging_info: formData.get("packaging_info"),
      pallet_info: formData.get("pallet_info"),
      vehicle_info: formData.get("vehicle_info"),
      dispatch_date: formData.get("dispatch_date"),
      notes: formData.get("notes"),
      status: formData.get("status"),
    };

    onSubmit(values);
  };

  return (
    <form className="production-form" onSubmit={handleSubmit}>
      <div className="production-form-grid">
        <div className="production-field">
          <label className="production-label">Lot Numarası</label>
          <input name="lot_no" className="production-input" defaultValue={initialValues.lot_no} />
          {errors.lot_no ? <p className="production-error">{errors.lot_no}</p> : null}
        </div>

        <div className="production-field">
          <label className="production-label">Müşteri Adı</label>
          <input
            name="customer_name"
            className="production-input"
            defaultValue={initialValues.customer_name}
          />
          {errors.customer_name ? <p className="production-error">{errors.customer_name}</p> : null}
        </div>

        <div className="production-field production-field--full">
          <label className="production-label">Ürün Bilgisi</label>
          <input
            name="product_name"
            className="production-input"
            defaultValue={initialValues.product_name}
            placeholder="Örn: Kavrulmuş iç fındık 11/13 MM"
          />
          {errors.product_name ? <p className="production-error">{errors.product_name}</p> : null}
        </div>

        <div className="production-field">
          <label className="production-label">Miktar</label>
          <input
            name="quantity"
            className="production-input"
            type="number"
            step="0.001"
            min="0"
            defaultValue={initialValues.quantity}
          />
          {errors.quantity ? <p className="production-error">{errors.quantity}</p> : null}
        </div>

        <div className="production-field">
          <label className="production-label">Birim</label>
          <select name="quantity_unit" className="production-input" defaultValue={initialValues.quantity_unit}>
            {QUANTITY_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          {errors.quantity_unit ? <p className="production-error">{errors.quantity_unit}</p> : null}
        </div>

        <div className="production-field">
          <label className="production-label">Paketleme Bilgisi</label>
          <input
            name="packaging_info"
            className="production-input"
            defaultValue={initialValues.packaging_info}
          />
          {errors.packaging_info ? <p className="production-error">{errors.packaging_info}</p> : null}
        </div>

        <div className="production-field">
          <label className="production-label">Palet Bilgisi</label>
          <input name="pallet_info" className="production-input" defaultValue={initialValues.pallet_info} />
          {errors.pallet_info ? <p className="production-error">{errors.pallet_info}</p> : null}
        </div>

        <div className="production-field">
          <label className="production-label">Araç Bilgisi</label>
          <input
            name="vehicle_info"
            className="production-input"
            defaultValue={initialValues.vehicle_info || ""}
            placeholder="Örn: 52 ABC 123 / Tır 1"
          />
        </div>

        <div className="production-field">
          <label className="production-label">Çıkış Tarihi</label>
          <input
            name="dispatch_date"
            className="production-input"
            type="date"
            defaultValue={initialValues.dispatch_date || ""}
          />
        </div>

        <div className="production-field">
          <label className="production-label">Durum</label>
          <select name="status" className="production-input" defaultValue={initialValues.status}>
            {PRODUCTION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status] || status}
              </option>
            ))}
          </select>
          {errors.status ? <p className="production-error">{errors.status}</p> : null}
        </div>

        <div className="production-field production-field--full">
          <label className="production-label">Not</label>
          <textarea
            name="notes"
            className="production-textarea"
            rows="4"
            defaultValue={initialValues.notes || ""}
            placeholder="Operasyon notu, sevkiyat notu, özel uyarılar..."
          />
        </div>
      </div>

      <div className="production-form-actions">
        <button type="submit" className="production-button production-button--primary" disabled={loading}>
          {loading ? "Kaydediliyor..." : submitLabel}
        </button>
      </div>
    </form>
  );
}