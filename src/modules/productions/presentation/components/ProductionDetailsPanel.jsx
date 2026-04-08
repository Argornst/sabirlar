import {
  formatDispatchDateLabel,
  formatQuantityLabel,
} from "../../domain/entities/production.entity";
import { ProductionStatusBadge } from "./ProductionStatusBadge";

export default function ProductionDetailsPanel({ item }) {
  if (!item) return null;

  return (
    <div className="production-details-panel">
      <div className="production-details-grid">
        <div className="production-details-item">
          <span>Lot No</span>
          <strong>{item.lot_no || "-"}</strong>
        </div>

        <div className="production-details-item">
          <span>Müşteri</span>
          <strong>{item.customer_name || "-"}</strong>
        </div>

        <div className="production-details-item">
          <span>Durum</span>
          <div className="production-details-item__badge">
            <ProductionStatusBadge status={item.status} />
          </div>
        </div>

        <div className="production-details-item production-details-item--full">
          <span>Ürün Bilgisi</span>
          <strong>{item.product_name || "-"}</strong>
        </div>

        <div className="production-details-item">
          <span>Miktar</span>
          <strong>{formatQuantityLabel(item.quantity, item.quantity_unit)}</strong>
        </div>

        <div className="production-details-item">
          <span>Paketleme</span>
          <strong>{item.packaging_info || "-"}</strong>
        </div>

        <div className="production-details-item">
          <span>Palet</span>
          <strong>{item.pallet_info || "-"}</strong>
        </div>

        <div className="production-details-item">
          <span>Araç</span>
          <strong>{item.vehicle_info || "Atanmadı"}</strong>
        </div>

        <div className="production-details-item">
          <span>Çıkış Tarihi</span>
          <strong>{formatDispatchDateLabel(item.dispatch_date)}</strong>
        </div>

        <div className="production-details-item">
          <span>Oluşturulma</span>
          <strong>{formatDispatchDateLabel(item.created_at)}</strong>
        </div>

        <div className="production-details-item">
          <span>Güncellenme</span>
          <strong>{formatDispatchDateLabel(item.updated_at)}</strong>
        </div>

        <div className="production-details-item production-details-item--full">
          <span>Not</span>
          <strong>{item.notes || "Not bulunmuyor."}</strong>
        </div>
      </div>
    </div>
  );
}