import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../../../shared/components/ui/Button";
import Field from "../../../../shared/components/ui/Field";
import { formatCurrency } from "../../../../shared/utils/currency";
import { updateSaleSchema } from "../../application/dto/updateSaleSchema";
import { useUpdateSale } from "../hooks/useUpdateSale";

function getSaleFlags(status) {
  switch (status) {
    case "odendi":
    case "paid":
      return { paid: true, invoiced: false };
    case "faturalandi":
      return { paid: false, invoiced: true };
    case "odendi_faturalandi":
      return { paid: true, invoiced: true };
    case "beklemede":
    case "pending":
    default:
      return { paid: false, invoiced: false };
  }
}

function buildSaleStatus({ paid, invoiced }) {
  if (paid && invoiced) return "odendi_faturalandi";
  if (paid) return "odendi";
  if (invoiced) return "faturalandi";
  return "beklemede";
}

export default function EditSaleInlineForm({ sale, onCancel, onSuccess }) {
  const mutation = useUpdateSale();

  const initialFlags = useMemo(() => getSaleFlags(sale?.status), [sale?.status]);

  const form = useForm({
    resolver: zodResolver(updateSaleSchema),
    defaultValues: {
      saleDate: sale?.saleDate ? String(sale.saleDate).slice(0, 10) : "",
      customerName: sale?.customerName ?? "",
      quantity: sale?.quantity ?? 1,
      paymentStatus: initialFlags.paid ? "odendi" : "beklemede",
      invoiceStatus: initialFlags.invoiced ? "faturalandi" : "faturalanmadi",
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
    const flags = getSaleFlags(sale?.status);

    reset({
      saleDate: sale?.saleDate ? String(sale.saleDate).slice(0, 10) : "",
      customerName: sale?.customerName ?? "",
      quantity: sale?.quantity ?? 1,
      paymentStatus: flags.paid ? "odendi" : "beklemede",
      invoiceStatus: flags.invoiced ? "faturalandi" : "faturalanmadi",
      note: sale?.note ?? "",
    });
  }, [sale, reset]);

  const quantity = Number(watch("quantity") ?? 0);
  const paymentStatus = watch("paymentStatus");
  const invoiceStatus = watch("invoiceStatus");

  const unitPrice = Number(sale?.unitPrice ?? 0);
  const totalAmount = Number(sale?.totalAmount ?? 0);

  const derivedStatus = buildSaleStatus({
    paid: paymentStatus === "odendi",
    invoiced: invoiceStatus === "faturalandi",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        sale,
        values: {
          saleDate: values.saleDate,
          customerName: values.customerName,
          quantity: values.quantity,
          status: buildSaleStatus({
            paid: values.paymentStatus === "odendi",
            invoiced: values.invoiceStatus === "faturalandi",
          }),
          note: values.note,
        },
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
        label="Ödeme Durumu"
        htmlFor={`edit-payment-status-${sale.id}`}
      >
        <select
          id={`edit-payment-status-${sale.id}`}
          className="form-select"
          {...register("paymentStatus")}
        >
          <option value="beklemede">Beklemede</option>
          <option value="odendi">Ödendi</option>
        </select>
      </Field>

      <Field
        label="Faturalama Durumu"
        htmlFor={`edit-invoice-status-${sale.id}`}
      >
        <select
          id={`edit-invoice-status-${sale.id}`}
          className="form-select"
          {...register("invoiceStatus")}
        >
          <option value="faturalanmadi">Faturalanmadı</option>
          <option value="faturalandi">Faturalandı</option>
        </select>
      </Field>

      <Field
        label="Sistem Durumu"
        htmlFor={`edit-derived-status-${sale.id}`}
      >
        <input
          id={`edit-derived-status-${sale.id}`}
          type="text"
          value={derivedStatus}
          readOnly
        />
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