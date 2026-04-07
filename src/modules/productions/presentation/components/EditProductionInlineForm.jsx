import { useEffect, useState } from "react";
import { PRODUCTION_STATUSES, QUANTITY_UNITS } from "../../domain/entities/production.entity";
import { useUpdateProductionMutation } from "../hooks/useUpdateProductionMutation";

const STATUS_LABELS = {
  hazirlaniyor: "Hazırlanıyor",
  hazir: "Hazır",
  sevk_planlandi: "Sevk Planlandı",
  sevk_edildi: "Sevk Edildi",
};

export default function EditProductionInlineForm({
  item,
  onCancel,
  onSuccess,
}) {
  const updateMutation = useUpdateProductionMutation();
  const [formState, setFormState] = useState({
    lot_no: "",
    customer_name: "",
    product_name: "",
    quantity: "",
    quantity_unit: "kg",
    packaging_info: "",
    pallet_info: "",
    vehicle_info: "",
    dispatch_date: "",
    notes: "",
    status: "hazirlaniyor",
  });

  useEffect(() => {
    if (!item) return;

    setFormState({
      lot_no: item.lot_no || "",
      customer_name: item.customer_name || "",
      product_name: item.product_name || "",
      quantity: item.quantity ?? "",
      quantity_unit: item.quantity_unit || "kg",
      packaging_info: item.packaging_info || "",
      pallet_info: item.pallet_info || "",
      vehicle_info: item.vehicle_info || "",
      dispatch_date: item.dispatch_date || "",
      notes: item.notes || "",
      status: item.status || "hazirlaniyor",
    });
  }, [item]);

  function updateField(name, value) {
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await updateMutation.mutateAsync({
        id: item.id,
        values: {
          ...item,
          ...formState,
        },
      });

      onSuccess?.();
    } catch (error) {
      console.error("Production update error:", error);
      window.alert(
        error?.message || error?.details || "Kayıt güncellenirken hata oluştu."
      );
    }
  }

  return (
    <form className="production-inline-form" onSubmit={handleSubmit}>
      <div className="production-inline-form__grid">
        <div className="production-field">
          <label className="production-label">Lot</label>
          <input
            className="production-input"
            value={formState.lot_no}
            onChange={(e) => updateField("lot_no", e.target.value)}
          />
        </div>

        <div className="production-field">
          <label className="production-label">Müşteri</label>
          <input
            className="production-input"
            value={formState.customer_name}
            onChange={(e) => updateField("customer_name", e.target.value)}
          />
        </div>

        <div className="production-field production-field--full">
          <label className="production-label">Ürün</label>
          <input
            className="production-input"
            value={formState.product_name}
            onChange={(e) => updateField("product_name", e.target.value)}
          />
        </div>

        <div className="production-field">
          <label className="production-label">Miktar</label>
          <input
            className="production-input"
            type="number"
            step="0.001"
            min="0"
            value={formState.quantity}
            onChange={(e) => updateField("quantity", e.target.value)}
          />
        </div>

        <div className="production-field">
          <label className="production-label">Birim</label>
          <select
            className="production-input"
            value={formState.quantity_unit}
            onChange={(e) => updateField("quantity_unit", e.target.value)}
          >
            {QUANTITY_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div className="production-field">
          <label className="production-label">Paketleme</label>
          <input
            className="production-input"
            value={formState.packaging_info}
            onChange={(e) => updateField("packaging_info", e.target.value)}
          />
        </div>

        <div className="production-field">
          <label className="production-label">Palet</label>
          <input
            className="production-input"
            value={formState.pallet_info}
            onChange={(e) => updateField("pallet_info", e.target.value)}
          />
        </div>

        <div className="production-field">
          <label className="production-label">Araç</label>
          <input
            className="production-input"
            value={formState.vehicle_info}
            onChange={(e) => updateField("vehicle_info", e.target.value)}
          />
        </div>

        <div className="production-field">
          <label className="production-label">Çıkış Tarihi</label>
          <input
            className="production-input"
            type="date"
            value={formState.dispatch_date}
            onChange={(e) => updateField("dispatch_date", e.target.value)}
          />
        </div>

        <div className="production-field">
          <label className="production-label">Durum</label>
          <select
            className="production-input"
            value={formState.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            {PRODUCTION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status] || status}
              </option>
            ))}
          </select>
        </div>

        <div className="production-field production-field--full">
          <label className="production-label">Not</label>
          <textarea
            className="production-textarea"
            rows="4"
            value={formState.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>
      </div>

      <div className="production-inline-form__actions">
        <button
          type="button"
          className="production-button production-button--ghost"
          onClick={onCancel}
          disabled={updateMutation.isPending}
        >
          İptal
        </button>

        <button
          type="submit"
          className="production-button production-button--primary"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}