import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../../../shared/components/ui/Button";
import Field from "../../../../shared/components/ui/Field";
import { updateProductSchema } from "../../application/dto/updateProductSchema";
import { useUpdateProduct } from "../hooks/useUpdateProduct";

export default function EditProductInlineForm({
  product,
  onCancel,
  onSuccess,
}) {
  const mutation = useUpdateProduct();

  const form = useForm({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      unit: product?.unit ?? "",
      unitPrice: product?.unitPrice ?? 0,
      vatType: product?.vatType ?? "HARIC",
      vatRate: product?.vatRate ?? 0,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset({
      name: product?.name ?? "",
      unit: product?.unit ?? "",
      unitPrice: product?.unitPrice ?? 0,
      vatType: product?.vatType ?? "HARIC",
      vatRate: product?.vatRate ?? 0,
    });
  }, [product, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        productId: product.id,
        values,
      });

      onSuccess?.();
    } catch (error) {
      console.error("Product update error:", error);
    }
  });

  return (
    <form className="form-grid form-grid--two-columns" onSubmit={onSubmit}>
      <Field label="Ürün Adı" htmlFor={`edit-name-${product.id}`} error={errors.name?.message}>
        <input
          id={`edit-name-${product.id}`}
          type="text"
          {...register("name")}
        />
      </Field>

      <Field label="Birim" htmlFor={`edit-unit-${product.id}`} error={errors.unit?.message}>
        <input
          id={`edit-unit-${product.id}`}
          type="text"
          {...register("unit")}
        />
      </Field>

      <Field
        label="Birim Fiyat"
        htmlFor={`edit-unit-price-${product.id}`}
        error={errors.unitPrice?.message}
      >
        <input
          id={`edit-unit-price-${product.id}`}
          type="number"
          step="0.01"
          min="0"
          {...register("unitPrice")}
        />
      </Field>

      <Field
        label="KDV Tipi"
        htmlFor={`edit-vat-type-${product.id}`}
        error={errors.vatType?.message}
      >
        <select
          id={`edit-vat-type-${product.id}`}
          className="form-select"
          {...register("vatType")}
        >
          <option value="HARIC">HARIC</option>
          <option value="DAHIL">DAHIL</option>
        </select>
      </Field>

      <Field
        label="KDV Oranı"
        htmlFor={`edit-vat-rate-${product.id}`}
        error={errors.vatRate?.message}
      >
        <input
          id={`edit-vat-rate-${product.id}`}
          type="number"
          step="0.01"
          min="0"
          {...register("vatRate")}
        />
      </Field>

      {mutation.error ? (
        <div className="error-text">
          {mutation.error.message || "Ürün güncellenemedi."}
        </div>
      ) : null}

      <div className="form-actions">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Kaydediliyor..." : "Kaydet"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Vazgeç
        </Button>
      </div>
    </form>
  );
}