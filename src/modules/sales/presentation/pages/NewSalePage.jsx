import { useMemo } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import Button from "../../../../shared/components/ui/Button";
import Card from "../../../../shared/components/ui/Card";
import DatePicker from "../../../../shared/components/ui/DatePicker";
import Field from "../../../../shared/components/ui/Field";
import Input from "../../../../shared/components/ui/Input";
import PageHeader from "../../../../shared/components/ui/PageHeader";
import SectionCard from "../../../../shared/components/ui/SectionCard";
import Select from "../../../../shared/components/ui/Select";
import { formatCurrency } from "../../../../shared/utils/currency";
import { useProductsListQuery } from "../../../products/presentation/hooks/useProductsListQuery";
import SaleItemsEditor from "../components/SaleItemsEditor";
import { useCreateSaleForm } from "../hooks/useCreateSaleForm";
import "../../sales.css";

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
    formState: { errors },
    isSubmitting,
    submitError,
  } = useCreateSaleForm();

  const { data: products = [], isLoading: productsLoading } = useProductsListQuery();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
    defaultValue: [],
  });
  const paymentStatus = useWatch({
    control,
    name: "paymentStatus",
    defaultValue: "beklemede",
  });
  const invoiceStatus = useWatch({
    control,
    name: "invoiceStatus",
    defaultValue: "faturalanmadi",
  });

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
              <Controller
                control={control}
                name="saleDate"
                render={({ field }) => (
                  <DatePicker
                    name={field.name}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="gg.aa.yyyy"
                  />
                )}
              />
            </Field>

            <Field
              label="Müşteri Adı"
              htmlFor="customerName"
              error={errors.customerName?.message}
            >
              <Input
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
              <Select id="paymentStatus" {...register("paymentStatus")}>
                <option value="beklemede">Beklemede</option>
                <option value="odendi">Ödendi</option>
              </Select>
            </Field>

            <Field
              label="Faturalama Durumu"
              htmlFor="invoiceStatus"
              error={errors.invoiceStatus?.message}
            >
              <Select id="invoiceStatus" {...register("invoiceStatus")}>
                <option value="faturalanmadi">Faturalanmadı</option>
                <option value="faturalandi">Faturalandı</option>
              </Select>
            </Field>

            <Field label="Not" htmlFor="note" fullWidth>
              <Input
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
                control={control}
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
