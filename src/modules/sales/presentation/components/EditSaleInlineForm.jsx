import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../../../shared/components/ui/Button";
import Field from "../../../../shared/components/ui/Field";
import { formatCurrency } from "../../../../shared/utils/currency";
import { updateSaleSchema } from "../../application/dto/updateSaleSchema";
import { useUpdateSale } from "../hooks/useUpdateSale";

export default function EditSaleInlineForm({ sale, onCancel, onSuccess }) {
  const mutation = useUpdateSale();

  const form = useForm({
    resolver: zodResolver(updateSaleSchema),
    defaultValues: {
      saleDate: sale?.saleDate ? String(sale.saleDate).slice(0, 10) : "",
      customerName: sale?.customerName ?? "",
      quantity: sale?.quantity ?? 1,
      status: sale?.status ?? "beklemede",
      note: sale?.note ?? "",
    },
  });

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset({
      saleDate: sale?.saleDate ? String(sale.saleDate).slice(0, 10) : "",
      customerName: sale?.customerName ?? "",
      quantity: sale?.quantity ?? 1,
      status: sale?.status ?? "beklemede",
      note: sale?.note ?? "",
    });
  }, [sale, reset]);

  const quantity = Number(watch("quantity") ?? 0);
  const unitPrice = Number(sale?.unitPrice ?? 0);
  const vatRate = Number(sale?.vatRate ?? 0);
  const vatType = sale?.vatType ?? "HARIC";
  const subtotal = quantity * unitPrice;
  const vatAmount = vatType === "HARIC" ? subtotal * (vatRate / 100) : 0;
  const totalAmount = vatType === "HARIC" ? subtotal + vatAmount : subtotal;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        sale,
        values,
      });

      onSuccess?.();
    } catch (error) {
      console.error("Sale update error:", error);
    }
  });

  return (
    <form className="form-grid form-grid--two-columns" onSubmit={onSubmit}>
      <Field
        label="Satış Tarihi"
        htmlFor={`edit-sale-date-${sale.id}`}
        error={errors.saleDate?.message}
      >
        <input
          id={`edit-sale-date-${sale.id}`}
          type="date"
          {...register("saleDate")}
        />
      </Field>

      <Field
        label="Müşteri Adı"
        htmlFor={`edit-customer-${sale.id}`}
        error={errors.customerName?.message}
      >
        <input
          id={`edit-customer-${sale.id}`}
          type="text"
          {...register("customerName")}
        />
      </Field>

      <Field
        label="Adet"
        htmlFor={`edit-quantity-${sale.id}`}
        error={errors.quantity?.message}
      >
        <input
          id={`edit-quantity-${sale.id}`}
          type="number"
          min="1"
          {...register("quantity")}
        />
      </Field>

      <Field
        label="Durum"
        htmlFor={`edit-status-${sale.id}`}
        error={errors.status?.message}
      >
        <select
          id={`edit-status-${sale.id}`}
          className="form-select"
          {...register("status")}
        >
          <option value="beklemede">beklemede</option>
          <option value="odendi">odendi</option>
          <option value="faturalandi">faturalandi</option>
          <option value="odendi_faturalandi">odendi_faturalandi</option>
        </select>
      </Field>

      <Field
        label="Not"
        htmlFor={`edit-note-${sale.id}`}
        fullWidth
        error={errors.note?.message}
      >
        <input
          id={`edit-note-${sale.id}`}
          type="text"
          placeholder="Opsiyonel not"
          {...register("note")}
        />
      </Field>

      <div className="sales-edit-summary">
        <div className="summary-item">
          <span>Birim Fiyat</span>
          <strong>{formatCurrency(unitPrice, "TRY")}</strong>
        </div>
        <div className="summary-item">
          <span>KDV Tipi</span>
          <strong>{vatType}</strong>
        </div>
        <div className="summary-item">
          <span>KDV Oranı</span>
          <strong>%{vatRate}</strong>
        </div>
        <div className="summary-item">
          <span>Ara Toplam</span>
          <strong>{formatCurrency(subtotal, "TRY")}</strong>
        </div>
        <div className="summary-item">
          <span>KDV</span>
          <strong>{formatCurrency(vatAmount, "TRY")}</strong>
        </div>
        <div className="summary-item summary-item--highlight">
          <span>Genel Toplam</span>
          <strong>{formatCurrency(totalAmount, "TRY")}</strong>
        </div>
      </div>

      {mutation.error ? (
        <div className="error-text">
          {mutation.error.message || "Satış güncellenemedi."}
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