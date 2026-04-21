import { useEffect, useMemo, useState } from "react";
import {
  PRODUCTION_STATUSES,
  QUANTITY_UNITS,
} from "../../domain/entities/production.entity";
import { useUpdateProductionMutation } from "../hooks/useUpdateProductionMutation";
import { listProductionProductOptions } from "../../runtime/productions.runtime";

import Field from "../../../../shared/components/ui/Field";
import Input from "../../../../shared/components/ui/Input";
import Select from "../../../../shared/components/ui/Select";
import Textarea from "../../../../shared/components/ui/Textarea";
import Button from "../../../../shared/components/ui/Button";
import DatePicker from "../../../../shared/components/ui/DatePicker";
import ProductAutocomplete from "./ProductAutocomplete";

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
  const productOptions = useMemo(() => listProductionProductOptions(), []);
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
        <Field label="Lot">
          <Input
            value={formState.lot_no}
            onChange={(e) => updateField("lot_no", e.target.value)}
          />
        </Field>

        <Field label="Müşteri">
          <Input
            value={formState.customer_name}
            onChange={(e) => updateField("customer_name", e.target.value)}
          />
        </Field>

        <Field label="Ürün" className="span-2">
          <ProductAutocomplete
            value={formState.product_name}
            onChange={(nextValue) => updateField("product_name", nextValue)}
            options={productOptions}
            allowManualEntry
            placeholder="Ürün seçin veya yazın"
            hint="Listeden seçebilir veya manuel girebilirsiniz"
          />
        </Field>

        <Field label="Miktar">
          <Input
            type="number"
            step="0.001"
            min="0"
            value={formState.quantity}
            onChange={(e) => updateField("quantity", e.target.value)}
          />
        </Field>

        <Field label="Birim">
          <Select
            value={formState.quantity_unit}
            onChange={(e) => updateField("quantity_unit", e.target.value)}
          >
            {QUANTITY_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Paketleme">
          <Input
            value={formState.packaging_info}
            onChange={(e) => updateField("packaging_info", e.target.value)}
          />
        </Field>

        <Field label="Palet">
          <Input
            value={formState.pallet_info}
            onChange={(e) => updateField("pallet_info", e.target.value)}
          />
        </Field>

        <Field label="Araç">
          <Input
            value={formState.vehicle_info}
            onChange={(e) => updateField("vehicle_info", e.target.value)}
          />
        </Field>

        <Field label="Çıkış Tarihi">
          <DatePicker
            value={formState.dispatch_date}
            onChange={(event) => updateField("dispatch_date", event.target.value)}
            placeholder="gg.aa.yyyy"
          />
        </Field>

        <Field label="Durum">
          <Select
            value={formState.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            {PRODUCTION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status] || status}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Not" className="span-2">
          <Textarea
            rows={4}
            value={formState.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </Field>
      </div>

      <div className="production-inline-form__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={updateMutation.isPending}
        >
          İptal
        </Button>

        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}