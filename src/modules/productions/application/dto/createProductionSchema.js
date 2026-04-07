import {
  normalizeProductionPayload,
  PRODUCTION_STATUSES,
  QUANTITY_UNITS,
} from '../../domain/entities/production.entity';

export const validateCreateProduction = (values) => {
  const payload = normalizeProductionPayload(values);
  const errors = {};

  if (!payload.lot_no) errors.lot_no = 'Lot numarası zorunludur.';
  if (!payload.customer_name) errors.customer_name = 'Müşteri adı zorunludur.';
  if (!payload.product_name) errors.product_name = 'Ürün bilgisi zorunludur.';
  if (!payload.quantity || payload.quantity <= 0) {
    errors.quantity = 'Miktar 0’dan büyük olmalıdır.';
  }
  if (!payload.quantity_unit || !QUANTITY_UNITS.includes(payload.quantity_unit)) {
    errors.quantity_unit = 'Geçerli bir birim seçin.';
  }
  if (!payload.packaging_info) {
    errors.packaging_info = 'Paketleme bilgisi zorunludur.';
  }
  if (!payload.pallet_info) {
    errors.pallet_info = 'Palet bilgisi zorunludur.';
  }
  if (!payload.status || !PRODUCTION_STATUSES.includes(payload.status)) {
    errors.status = 'Geçerli bir durum seçin.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    payload,
  };
};