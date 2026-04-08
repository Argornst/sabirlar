import {
  PRODUCTION_STATUSES,
  QUANTITY_UNITS,
} from "../../domain/entities/production.entity";

import Field from "../../../../shared/components/ui/Field";
import Input from "../../../../shared/components/ui/Input";
import Select from "../../../../shared/components/ui/Select";
import Textarea from "../../../../shared/components/ui/Textarea";
import Button from "../../../../shared/components/ui/Button";

const STATUS_LABELS = {
  hazirlaniyor: "Hazırlanıyor",
  hazir: "Hazır",
  sevk_planlandi: "Sevk Planlandı",
  sevk_edildi: "Sevk Edildi",
};

export function ProductionForm({
  initialValues,
  errors = {},
  loading = false,
  submitLabel = "Kaydet",
  onSubmit,
}) {
  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const values = {
      lot_no: formData.get("lot_no")?.toString().trim(),
      customer_name: formData.get("customer_name")?.toString().trim(),
      product_name: formData.get("product_name")?.toString().trim(),
      quantity: Number(formData.get("quantity")),
      quantity_unit: formData.get("quantity_unit"),
      packaging_info: formData.get("packaging_info")?.toString().trim(),
      pallet_info: formData.get("pallet_info")?.toString().trim(),
      vehicle_info: formData.get("vehicle_info")?.toString().trim(),
      dispatch_date: formData.get("dispatch_date") || null,
      status: formData.get("status"),
      notes: formData.get("notes")?.toString().trim(),
    };

    onSubmit?.(values);
  }

  return (
    <form className="production-form-grid" onSubmit={handleSubmit}>
      {/* LOT */}
      <Field label="Lot Numarası" error={errors.lot_no}>
        <Input
          name="lot_no"
          defaultValue={initialValues.lot_no}
          placeholder="LOT-2026-001"
        />
      </Field>

      {/* MÜŞTERİ */}
      <Field label="Müşteri" error={errors.customer_name}>
        <Input
          name="customer_name"
          defaultValue={initialValues.customer_name}
          placeholder="Müşteri adı"
        />
      </Field>

      {/* ÜRÜN */}
      <Field label="Ürün" error={errors.product_name} className="span-2">
        <Input
          name="product_name"
          defaultValue={initialValues.product_name}
          placeholder="Ürün adı"
        />
      </Field>

      {/* MİKTAR */}
      <Field label="Miktar" error={errors.quantity}>
        <Input
          name="quantity"
          type="number"
          step="0.001"
          min="0"
          defaultValue={initialValues.quantity}
        />
      </Field>

      {/* BİRİM */}
      <Field label="Birim">
        <Select name="quantity_unit" defaultValue={initialValues.quantity_unit}>
          {QUANTITY_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </Select>
      </Field>

      {/* PAKETLEME */}
      <Field label="Paketleme">
        <Input
          name="packaging_info"
          defaultValue={initialValues.packaging_info}
          placeholder="Örn: 25kg çuval"
        />
      </Field>

      {/* PALET */}
      <Field label="Palet">
        <Input
          name="pallet_info"
          defaultValue={initialValues.pallet_info}
          placeholder="Örn: 20 palet"
        />
      </Field>

      {/* ARAÇ */}
      <Field label="Araç">
        <Input
          name="vehicle_info"
          defaultValue={initialValues.vehicle_info}
          placeholder="Tır / Konteyner"
        />
      </Field>

      {/* TARİH */}
      <Field label="Çıkış Tarihi">
        <Input
          name="dispatch_date"
          type="date"
          defaultValue={initialValues.dispatch_date || ""}
        />
      </Field>

      {/* DURUM */}
      <Field label="Durum">
        <Select name="status" defaultValue={initialValues.status}>
          {PRODUCTION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
      </Field>

      {/* NOT */}
      <Field label="Not" className="span-2">
        <Textarea
          name="notes"
          rows={4}
          defaultValue={initialValues.notes}
          placeholder="Ek açıklamalar..."
        />
      </Field>

      {/* ACTIONS */}
      <div className="production-form-actions span-2">
        <Button type="submit" loading={loading} className="btn-premium">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}