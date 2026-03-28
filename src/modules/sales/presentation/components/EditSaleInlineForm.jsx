import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../../../shared/components/ui/Button";
import Field from "../../../../shared/components/ui/Field";
import { formatCurrency } from "../../../../shared/utils/currency";
import { updateSaleSchema } from "../../application/dto/updateSaleSchema";
import { useUpdateSale } from "../hooks/useUpdateSale";

function createDefaultItems(sale) {
  if (Array.isArray(sale?.items) && sale.items.length) {
    return sale.items.map((item) => ({
      productId: String(item.productId ?? ""),
      quantity: Number(item.quantity ?? 1),
    }));
  }

  return [{ productId: "", quantity: 1 }];
}

function calculateTotals(items, products) {
  return (items ?? []).reduce(
    (acc, item) => {
      const product = products.find(
        (entry) => String(entry.id) === String(item?.productId)
      );

      const quantity = Number(item?.quantity ?? 0);
      const unitPrice = Number(product?.unitPrice ?? product?.unit_price ?? 0);
      const totalAmount = quantity * unitPrice;

      acc.totalAmount += totalAmount;
      acc.itemCount += quantity;

      return acc;
    },
    { totalAmount: 0, itemCount: 0 }
  );
}

export default function EditSaleInlineForm({
  sale,
  products = [],
  onCancel,
  onSuccess,
}) {
  const mutation = useUpdateSale();

  const form = useForm({
    resolver: zodResolver(updateSaleSchema),
    defaultValues: {
      saleDate: sale?.saleDate ? String(sale.saleDate).slice(0, 10) : "",
      customerName: sale?.customerName ?? "",
      paymentStatus: sale?.paymentStatus ?? "beklemede",
      invoiceStatus: sale?.invoiceStatus ?? "faturalanmadi",
      items: createDefaultItems(sale),
      note: sale?.note ?? "",
    },
  });

  const {
    control,
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    reset({
      saleDate: sale?.saleDate ? String(sale.saleDate).slice(0, 10) : "",
      customerName: sale?.customerName ?? "",
      paymentStatus: sale?.paymentStatus ?? "beklemede",
      invoiceStatus: sale?.invoiceStatus ?? "faturalanmadi",
      items: createDefaultItems(sale),
      note: sale?.note ?? "",
    });
  }, [sale, reset]);

  const watchedItems = watch("items") ?? [];

  const totals = useMemo(
    () => calculateTotals(watchedItems, products),
    [watchedItems, products]
  );

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
        label="Sipariş Tarihi"
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
        label="Ödeme Durumu"
        htmlFor={`edit-payment-status-${sale.id}`}
        error={errors.paymentStatus?.message}
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
        error={errors.invoiceStatus?.message}
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

      <div className="ui-field--full sale-items-editor">
        <div className="sale-items-editor__header">
          <div>
            <h4>Sipariş Kalemleri</h4>
            <p>Kalem ekle, düzenle veya kaldır.</p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => append({ productId: "", quantity: 1 })}
          >
            Ürün Ekle
          </Button>
        </div>

        <div className="sale-items-editor__list">
          {fields.map((field, index) => {
            const selectedProductId = watchedItems?.[index]?.productId;
            const quantity = Number(watchedItems?.[index]?.quantity ?? 0);

            const selectedProduct = products.find(
              (product) => String(product.id) === String(selectedProductId)
            );

            const unitPrice = Number(
              selectedProduct?.unitPrice ?? selectedProduct?.unit_price ?? 0
            );
            const lineTotal = unitPrice * quantity;

            return (
              <div key={field.id} className="sale-item-card">
                <div className="sale-item-card__top">
                  <strong>Kalem {index + 1}</strong>

                  {fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => remove(index)}
                    >
                      Kaldır
                    </Button>
                  ) : null}
                </div>

                <div className="form-grid form-grid--two-columns">
                  <Field
                    label="Ürün"
                    htmlFor={`edit-items.${index}.productId`}
                    error={errors?.items?.[index]?.productId?.message}
                  >
                    <select
                      id={`edit-items.${index}.productId`}
                      className="form-select"
                      {...register(`items.${index}.productId`)}
                    >
                      <option value="">Ürün seçin</option>

                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Adet"
                    htmlFor={`edit-items.${index}.quantity`}
                    error={errors?.items?.[index]?.quantity?.message}
                  >
                    <input
                      id={`edit-items.${index}.quantity`}
                      type="number"
                      min="0.001"
                      step="0.001"
                      {...register(`items.${index}.quantity`)}
                    />
                  </Field>
                </div>

                <div className="sale-item-card__summary sale-item-card__summary--compact">
                  <div className="summary-item">
                    <span>Birim</span>
                    <strong>{selectedProduct?.unit ?? "-"}</strong>
                  </div>

                  <div className="summary-item">
                    <span>Birim Fiyat</span>
                    <strong>{formatCurrency(unitPrice, "TRY")}</strong>
                  </div>

                  <div className="summary-item summary-item--highlight">
                    <span>Satır Toplamı</span>
                    <strong>{formatCurrency(lineTotal, "TRY")}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sales-edit-summary">
        <div className="summary-item">
          <span>Kalem Sayısı</span>
          <strong>{fields.length}</strong>
        </div>

        <div className="summary-item">
          <span>Toplam Adet</span>
          <strong>{totals.itemCount}</strong>
        </div>

        <div className="summary-item summary-item--highlight">
          <span>Genel Toplam</span>
          <strong>{formatCurrency(totals.totalAmount, "TRY")}</strong>
        </div>
      </div>

      {mutation.error ? (
        <div className="error-text">
          {mutation.error.message || "Sipariş güncellenemedi."}
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