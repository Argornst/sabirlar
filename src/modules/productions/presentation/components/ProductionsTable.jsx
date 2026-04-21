import { useMemo, useState } from "react";
import Table, {
  TableScroll,
  TableShell,
} from "../../../../shared/components/ui/Table";
import {
  formatDispatchDateLabel,
  formatQuantityLabel,
} from "../../domain/entities/production.entity";
import EditProductionInlineForm from "./EditProductionInlineForm";
import ProductionDetailsPanel from "./ProductionDetailsPanel";
import { ProductionRowActions } from "./ProductionRowActions";
import { ProductionStatusBadge } from "./ProductionStatusBadge";

export function ProductionsTable({ items }) {
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const safeItems = useMemo(
    () => (Array.isArray(items) ? items.filter((item) => item?.id) : []),
    [items]
  );

  if (!safeItems.length) {
    return (
      <div className="production-empty-state">
        <h3>Kayıt bulunamadı</h3>
        <p>Filtreleri temizleyin ya da yeni bir üretim kaydı ekleyin.</p>
      </div>
    );
  }

  function toggleEditing(id) {
    setEditingId((prev) => (prev === id ? null : id));
  }

  function toggleExpanded(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <TableShell className="production-table-shell">
      <TableScroll className="production-table-wrapper">
        <Table className="production-table production-table--premium">
          <thead>
            <tr>
              <th>Lot</th>
              <th>Müşteri</th>
              <th>Ürün</th>
              <th>Miktar</th>
              <th>Paketleme</th>
              <th>Palet</th>
              <th>Çıkış</th>
              <th>Durum</th>
              <th className="production-table__actions-col">İşlemler</th>
            </tr>
          </thead>

          <tbody>
            {safeItems.map((item) => {
              const isEditing = editingId === item.id;
              const isExpanded = expandedId === item.id;

              return (
                <>
                  <tr key={item.id} className="production-table__row">
                    <td>
                      <div className="production-table__primary">
                        <strong>{item.lot_no}</strong>
                      </div>
                    </td>

                    <td>{item.customer_name}</td>
                    <td>{item.product_name}</td>
                    <td>{formatQuantityLabel(item.quantity, item.quantity_unit)}</td>
                    <td>{item.packaging_info}</td>
                    <td>{item.pallet_info}</td>
                    <td>{formatDispatchDateLabel(item.dispatch_date)}</td>

                    <td>
                      <ProductionStatusBadge status={item.status} />
                    </td>

                    <td className="production-table__actions-col">
                      <ProductionRowActions
                        item={item}
                        isExpanded={isExpanded}
                        isEditing={isEditing}
                        onToggleExpanded={() => toggleExpanded(item.id)}
                        onEdit={() => toggleEditing(item.id)}
                      />
                    </td>
                  </tr>

                  {isEditing ? (
                    <tr className="production-table__detail-row" key={`${item.id}-edit`}>
                      <td colSpan={9}>
                        <div className="production-table__detail-card">
                          <EditProductionInlineForm
                            item={item}
                            onCancel={() => toggleEditing(item.id)}
                            onSuccess={() => toggleEditing(item.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ) : null}

                  {isExpanded ? (
                    <tr className="production-table__detail-row" key={`${item.id}-details`}>
                      <td colSpan={9}>
                        <div className="production-table__detail-card">
                          <ProductionDetailsPanel item={item} />
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </>
              );
            })}
          </tbody>
        </Table>
      </TableScroll>
    </TableShell>
  );
}
