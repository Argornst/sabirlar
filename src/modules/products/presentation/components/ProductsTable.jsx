import { useState } from "react";
import { formatCurrency } from "../../../../shared/utils/currency";
import StatusBadge from "../../../../shared/components/ui/StatusBadge";
import EditProductInlineForm from "./EditProductInlineForm";
import ProductRowActions from "./ProductRowActions";

export default function ProductsTable({ products = [] }) {
  const [editingProductId, setEditingProductId] = useState(null);

  if (!products.length) {
    return <div className="helper-text">Henüz ürün kaydı bulunmuyor.</div>;
  }

  return (
    <div className="products-table-shell">
      <div className="products-table-wrap">
        <table className="products-table">
          <thead>
            <tr>
              <th>Ürün</th>
              <th>Birim</th>
              <th>Birim Fiyat</th>
              <th>KDV</th>
              <th>Durum</th>
              <th className="products-table__actions-col">İşlemler</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const isEditing = editingProductId === product.id;

              return (
                <FragmentRow
                  key={product.id}
                  product={product}
                  isEditing={isEditing}
                  onToggleEditing={() =>
                    setEditingProductId((prev) =>
                      prev === product.id ? null : product.id
                    )
                  }
                  onCloseEditing={() => setEditingProductId(null)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FragmentRow({
  product,
  isEditing,
  onToggleEditing,
  onCloseEditing,
}) {
  return (
    <>
      <tr className="products-table__row">
        <td>
          <div className="products-table__product">
            <strong>{product.name}</strong>
            <span>#{product.id}</span>
          </div>
        </td>

        <td>
          <div className="products-table__unit">
            <strong>{product.unit || "-"}</strong>
          </div>
        </td>

        <td>
          <div className="products-table__price">
            <strong>{formatCurrency(product.unitPrice, "TRY")}</strong>
          </div>
        </td>

        <td>
          <div className="products-table__vat">
            <span className="products-table__vat-type">
              {product.vatType}
            </span>
            <span className="products-table__vat-rate">
              %{product.vatRate}
            </span>
          </div>
        </td>

        <td>
          <div className="products-table__badges products-table__badges--compact">
            <StatusBadge tone={product.isActive ? "success" : "danger"}>
              {product.isActive ? "Aktif" : "Pasif"}
            </StatusBadge>
          </div>
        </td>

        <td className="products-table__actions-col">
          <ProductRowActions
            product={product}
            isEditing={isEditing}
            onEdit={onToggleEditing}
          />
        </td>
      </tr>

      {isEditing ? (
        <tr className="products-table__detail-row">
          <td colSpan={6}>
            <div className="products-table__detail-card">
              <EditProductInlineForm
                product={product}
                onCancel={onCloseEditing}
                onSuccess={onCloseEditing}
              />
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}