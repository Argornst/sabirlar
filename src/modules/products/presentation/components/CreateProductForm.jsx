import Button from "../../../../shared/components/ui/Button";
import Field from "../../../../shared/components/ui/Field";
import { useCreateProductForm } from "../hooks/useCreateProductForm";

export default function CreateProductForm() {
  const {
    register,
    onSubmit,
    formState: { errors },
    isSubmitting,
    submitError,
  } = useCreateProductForm();

  return (
    <form className="form-grid form-grid--two-columns" onSubmit={onSubmit}>
      <Field label="Ürün Adı" htmlFor="name" error={errors.name?.message}>
        <input id="name" type="text" placeholder="Ürün adı" {...register("name")} />
      </Field>

      <Field label="Birim" htmlFor="unit" error={errors.unit?.message}>
        <input id="unit" type="text" placeholder="adet / kg" {...register("unit")} />
      </Field>

      <Field
        label="Birim Fiyat"
        htmlFor="unitPrice"
        error={errors.unitPrice?.message}
      >
        <input
          id="unitPrice"
          type="number"
          min="0"
          step="0.01"
          {...register("unitPrice")}
        />
      </Field>

      <Field label="KDV Tipi" htmlFor="vatType" error={errors.vatType?.message}>
        <select id="vatType" className="form-select" {...register("vatType")}>
          <option value="HARIC">HARIC</option>
          <option value="DAHIL">DAHIL</option>
        </select>
      </Field>

      <Field label="KDV Oranı" htmlFor="vatRate" error={errors.vatRate?.message}>
        <input
          id="vatRate"
          type="number"
          min="0"
          step="0.01"
          {...register("vatRate")}
        />
      </Field>

      {submitError ? <div className="error-text">{submitError}</div> : null}

      <div className="form-actions">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Kaydediliyor..." : "Ürünü Kaydet"}
        </Button>
      </div>
    </form>
  );
}