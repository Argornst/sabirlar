import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import Button from "../../../../shared/components/ui/Button";
import Field from "../../../../shared/components/ui/Field";
import Input from "../../../../shared/components/ui/Input";
import Select from "../../../../shared/components/ui/Select";
import { formatCurrency } from "../../../../shared/utils/currency";

function getProductMeta(product) {
  return {
    unit: product?.unit ?? "-",
    unitPrice: Number(product?.unitPrice ?? product?.unit_price ?? 0),
  };
}

function calculateLine(product, quantity) {
  const q = Number(quantity ?? 0);
  const meta = getProductMeta(product);

  const totalAmount = q * meta.unitPrice;

  return {
    ...meta,
    totalAmount,
  };
}

export default function SaleItemsEditor({
  fields,
  products,
  productsLoading,
  register,
  errors,
  control,
  append,
  remove,
}) {
  const watchedItems =
    useWatch({
      control,
      name: "items",
      defaultValue: [],
    }) ?? [];

  const productsById = useMemo(
    () => new Map(products.map((product) => [String(product.id), product])),
    [products]
  );

  return (
    <div className="sale-items-editor">
      <div className="sale-items-editor__header">
        <h4>Sipariş Kalemleri</h4>

        <Button
          type="button"
          variant="secondary"
          onClick={() => append({ productId: "", quantity: 1 })}
        >
          Ürün Ekle
        </Button>
      </div>

      {fields.map((field, index) => {
        const selectedId = watchedItems?.[index]?.productId;
        const quantity = watchedItems?.[index]?.quantity;
        const product = productsById.get(String(selectedId));
        const line = calculateLine(product, quantity);

        return (
          <div key={field.id} className="sale-item-card">
            <div className="form-grid form-grid--two-columns">
              <Field
                label="Ürün"
                error={errors?.items?.[index]?.productId?.message}
              >
                <Select {...register(`items.${index}.productId`)}>
                  <option value="">
                    {productsLoading ? "Yükleniyor..." : "Seç"}
                  </option>

                  {products.map((productItem) => (
                    <option key={productItem.id} value={productItem.id}>
                      {productItem.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Adet"
                error={errors?.items?.[index]?.quantity?.message}
              >
                <Input
                  type="number"
                  min="0.001"
                  step="0.001"
                  {...register(`items.${index}.quantity`)}
                />
              </Field>
            </div>

            <div className="sale-item-card__summary">
              <div className="summary-item">
                <span>Birim</span>
                <strong>{line.unit}</strong>
              </div>

              <div className="summary-item">
                <span>Birim Fiyat</span>
                <strong>{formatCurrency(line.unitPrice, "TRY")}</strong>
              </div>

              <div className="summary-item summary-item--highlight">
                <span>Satır Toplamı</span>
                <strong>{formatCurrency(line.totalAmount, "TRY")}</strong>
              </div>
            </div>

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
        );
      })}
    </div>
  );
}
