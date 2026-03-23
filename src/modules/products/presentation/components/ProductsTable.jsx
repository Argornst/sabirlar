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
    <div className="users-table-stack">
      {products.map((product) => {
        const isEditing = editingProductId === product.id;

        return (
          <div key={product.id} className="user-management-card">
            <div className="user-management-card__header">
              <div className="user-management-card__identity">
                <h4>{product.name}</h4>
                <p>
                  {product.unit} • {formatCurrency(product.unitPrice, "TRY")}
                </p>
              </div>

              <div className="user-management-card__badges">
                <StatusBadge tone={product.isActive ? "success" : "danger"}>
                  {product.isActive ? "active" : "inactive"}
                </StatusBadge>
                <StatusBadge tone="warning">
                  {product.vatType} %{product.vatRate}
                </StatusBadge>
              </div>
            </div>

            <div className="user-management-card__meta">
              <span><strong>ID:</strong> {product.id}</span>
              <span><strong>Birim:</strong> {product.unit}</span>
              <span><strong>Fiyat:</strong> {formatCurrency(product.unitPrice, "TRY")}</span>
            </div>

            <div className="user-management-card__actions-block">
              <h5>Ürün Aksiyonları</h5>
              <ProductRowActions
                product={product}
                onEdit={() =>
                  setEditingProductId((prev) => (prev === product.id ? null : product.id))
                }
              />
            </div>

            {isEditing ? (
              <div className="user-management-card__permissions">
                <h5>Ürün Düzenle</h5>
                <EditProductInlineForm
                  product={product}
                  onCancel={() => setEditingProductId(null)}
                  onSuccess={() => setEditingProductId(null)}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}