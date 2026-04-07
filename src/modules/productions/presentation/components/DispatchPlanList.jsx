import { formatQuantityLabel, formatDispatchDateLabel } from "../../domain/entities/production.entity";
import { ProductionStatusBadge } from "./ProductionStatusBadge";

const groupByDate = (items) => {
  return items.reduce((acc, item) => {
    const key = item.dispatch_date || "plansiz";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
};

export function DispatchPlanList({ items }) {
  if (!items.length) {
    return (
      <div className="production-empty-state">
        <h3>Sevkiyat planı boş</h3>
        <p>Çıkış tarihi atanmış kayıt bulunmuyor.</p>
      </div>
    );
  }

  const groupedItems = groupByDate(items);

  return (
    <div className="dispatch-plan-list">
      {Object.entries(groupedItems).map(([date, group]) => (
        <section key={date} className="production-card">
          <div className="production-card__header">
            <div>
              <h3 className="production-card__title">{formatDispatchDateLabel(date)}</h3>
              <p className="production-card__subtitle">{group.length} kayıt</p>
            </div>
          </div>

          <div className="dispatch-plan-items">
            {group.map((item) => (
              <article key={item.id} className="dispatch-plan-item">
                <div className="dispatch-plan-item__main">
                  <div className="dispatch-plan-item__top">
                    <strong>{item.customer_name}</strong>
                    <ProductionStatusBadge status={item.status} />
                  </div>

                  <p className="dispatch-plan-item__product">{item.product_name}</p>

                  <div className="dispatch-plan-item__meta">
                    <span>Lot: {item.lot_no}</span>
                    <span>Miktar: {formatQuantityLabel(item.quantity, item.quantity_unit)}</span>
                    <span>Paketleme: {item.packaging_info}</span>
                    <span>Palet: {item.pallet_info}</span>
                    <span>Araç: {item.vehicle_info || "Atanmadı"}</span>
                  </div>

                  {item.notes ? <p className="dispatch-plan-item__notes">{item.notes}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}