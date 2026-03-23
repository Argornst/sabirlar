import Card from "../../../../shared/components/ui/Card";
import Field from "../../../../shared/components/ui/Field";
import PageHeader from "../../../../shared/components/ui/PageHeader";
import SectionCard from "../../../../shared/components/ui/SectionCard";
import Button from "../../../../shared/components/ui/Button";
import { useProductsListQuery } from "../../../products/presentation/hooks/useProductsListQuery";
import { useCreateSaleForm } from "../hooks/useCreateSaleForm";
import { formatCurrency } from "../../../../shared/utils/currency";

export default function NewSalePage() {
  const {
    register,
    onSubmit,
    watch,
    formState: { errors },
    isSubmitting,
    submitError,
  } = useCreateSaleForm();

  const { data: products = [], isLoading: productsLoading } = useProductsListQuery();
  const selectedProductId = watch("productId");
  const selectedProduct = products.find(
    (product) => String(product.id) === String(selectedProductId)
  );

  const quantity = Number(watch("quantity") ?? 0);
  const subtotal = quantity * Number(selectedProduct?.unitPrice ?? 0);
  const vatAmount =
    selectedProduct?.vatType === "HARIC"
      ? subtotal * (Number(selectedProduct?.vatRate ?? 0) / 100)
      : 0;
  const total =
    selectedProduct?.vatType === "HARIC" ? subtotal + vatAmount : subtotal;

  return (
    <Card>
      <PageHeader
        title="New Sale"
        description="Ürün seçerek yeni satış kaydı oluşturun. Tutarlar otomatik hesaplanır."
        badge="Yeni Kayıt"
      />

      <div className="content-stack">
        <SectionCard
          title="Satış Formu"
          description="Temel satış bilgilerini girin"
        >
          <form className="form-grid form-grid--two-columns" onSubmit={onSubmit}>
            <Field
              label="Satış Tarihi"
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
              label="Ürün"
              htmlFor="productId"
              error={errors.productId?.message}
            >
              <select id="productId" className="form-select" {...register("productId")}>
                <option value="">
                  {productsLoading ? "Ürünler yükleniyor..." : "Ürün seçin"}
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Adet"
              htmlFor="quantity"
              error={errors.quantity?.message}
            >
              <input id="quantity" type="number" min="1" {...register("quantity")} />
            </Field>

            <Field
              label="Durum"
              htmlFor="status"
              error={errors.status?.message}
            >
              <select id="status" className="form-select" {...register("status")}>
                <option value="beklemede">beklemede</option>
                <option value="odendi">odendi</option>
                <option value="faturalandi">faturalandi</option>
                <option value="odendi_faturalandi">odendi_faturalandi</option>
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

            {submitError ? <div className="error-text">{submitError}</div> : null}

            <div className="form-actions">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Kaydediliyor..." : "Satışı Kaydet"}
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Hesap Özeti"
          description="Seçilen ürüne göre hesaplanan tutarlar"
        >
          <div className="summary-grid">
            <div className="summary-item">
              <span>Birim</span>
              <strong>{selectedProduct?.unit ?? "-"}</strong>
            </div>

            <div className="summary-item">
              <span>Birim Fiyat</span>
              <strong>{formatCurrency(selectedProduct?.unitPrice ?? 0, "TRY")}</strong>
            </div>

            <div className="summary-item">
              <span>KDV Tipi</span>
              <strong>{selectedProduct?.vatType ?? "-"}</strong>
            </div>

            <div className="summary-item">
              <span>KDV Oranı</span>
              <strong>%{selectedProduct?.vatRate ?? 0}</strong>
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
              <strong>{formatCurrency(total, "TRY")}</strong>
            </div>
          </div>
        </SectionCard>
      </div>
    </Card>
  );
}