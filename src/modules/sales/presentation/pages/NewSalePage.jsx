import { useMemo } from "react";
import { useFieldArray } from "react-hook-form";
import Card from "../../../../shared/components/ui/Card";
import Field from "../../../../shared/components/ui/Field";
import PageHeader from "../../../../shared/components/ui/PageHeader";
import SectionCard from "../../../../shared/components/ui/SectionCard";
import Button from "../../../../shared/components/ui/Button";
import { useProductsListQuery } from "../../../products/presentation/hooks/useProductsListQuery";
import { useCreateSaleForm } from "../hooks/useCreateSaleForm";
import { formatCurrency } from "../../../../shared/utils/currency";
import SaleItemsEditor from "../components/SaleItemsEditor";

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
    {
      totalAmount: 0,
      itemCount: 0,
    }
  );
}

export default function NewSalePage() {
  const {
    control,
    register,
    onSubmit,
    watch,
    formState: { errors },
    isSubmitting,
    submitError,
  } = useCreateSaleForm();

  const { data: products = [], isLoading: productsLoading } = useProductsListQuery();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items") ?? [];
  const paymentStatus = watch("paymentStatus");
  const invoiceStatus = watch("invoiceStatus");

  const totals = useMemo(
    () => calculateTotals(watchedItems, products),
    [watchedItems, products]
  );

  return (
    <Card>
      <PageHeader
        title="Yeni Sipariş"
        description="Bir sipariş içine birden fazla ürün ekleyin. Tutarlar otomatik hesaplanır."
        badge="Sipariş Oluştur"
      />

      <div className="content-stack">
        <SectionCard
          title="Sipariş Bilgileri"
          description="Temel sipariş alanlarını doldurun"
        >
          <form className="form-grid form-grid--two-columns" onSubmit={onSubmit}>
            <Field
              label="Sipariş Tarihi"
              htmlFor="saleDate"
              error={errors.saleDate?.message}
            >
              <input id="saleDate" type="date" {...register("saleDate")} />
            </Field>

            <Field
              label="Müşteri Adı"
              htmlFor="customerName"
              error={errors.customerName?.message}
            >
              <input
                id="customerName"
                type="text"
                placeholder="Müşteri adı"
                {...register("customerName")}
              />
            </Field>

            <Field
              label="Ödeme Durumu"
              htmlFor="paymentStatus"
              error={errors.paymentStatus?.message}
            >
              <select
                id="paymentStatus"
                className="form-select"
                {...register("paymentStatus")}
              >
                <option value="beklemede">Beklemede</option>
                <option value="odendi">Ödendi</option>
              </select>
            </Field>

            <Field
              label="Faturalama Durumu"
              htmlFor="invoiceStatus"
              error={errors.invoiceStatus?.message}
            >
              <select
                id="invoiceStatus"
                className="form-select"
                {...register("invoiceStatus")}
              >
                <option value="faturalanmadi">Faturalanmadı</option>
                <option value="faturalandi">Faturalandı</option>
              </select>
            </Field>

            <Field label="Not" htmlFor="note" fullWidth>
              <input
                id="note"
                type="text"
                placeholder="Opsiyonel not"
                {...register("note")}
              />
            </Field>

            <div className="ui-field--full">
              <SaleItemsEditor
                fields={fields}
                products={products}
                productsLoading={productsLoading}
                register={register}
                errors={errors}
                watch={watch}
                append={append}
                remove={remove}
              />
            </div>

            {submitError ? <div className="error-text">{submitError}</div> : null}

            <div className="form-actions">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Kaydediliyor..." : "Siparişi Kaydet"}
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Sipariş Özeti"
          description="Seçilen ürünlere göre hesaplanan toplamlar"
        >
          <div className="summary-grid">
            <div className="summary-item">
              <span>Kalem Sayısı</span>
              <strong>{fields.length}</strong>
            </div>

            <div className="summary-item">
              <span>Toplam Adet</span>
              <strong>{totals.itemCount}</strong>
            </div>

            <div className="summary-item">
              <span>Ödeme</span>
              <strong>{paymentStatus === "odendi" ? "Ödendi" : "Beklemede"}</strong>
            </div>

            <div className="summary-item">
              <span>Fatura</span>
              <strong>
                {invoiceStatus === "faturalandi"
                  ? "Faturalandı"
                  : "Faturalanmadı"}
              </strong>
            </div>

            <div className="summary-item summary-item--highlight">
              <span>Genel Toplam</span>
              <strong>{formatCurrency(totals.totalAmount, "TRY")}</strong>
            </div>
          </div>
        </SectionCard>
      </div>
    </Card>
  );
}