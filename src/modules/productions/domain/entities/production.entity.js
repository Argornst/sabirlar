export const PRODUCTION_STATUSES = [
  "hazirlaniyor",
  "hazir",
  "sevk_planlandi",
  "sevk_edildi",
];

export const QUANTITY_UNITS = ["kg", "adet", "koli", "palet", "ton"];

export const createEmptyProductionForm = () => ({
  lot_no: "",
  customer_name: "",
  product_name: "",
  quantity: "",
  quantity_unit: "kg",
  packaging_info: "",
  pallet_info: "",
  vehicle_info: "",
  dispatch_date: "",
  notes: "",
  status: "hazirlaniyor",
});

export const normalizeProductionPayload = (values) => {
  const quantityValue =
    typeof values.quantity === "number"
      ? values.quantity
      : Number(String(values.quantity).replace(",", "."));

  return {
    lot_no: String(values.lot_no || "").trim(),
    customer_name: String(values.customer_name || "").trim(),
    product_name: String(values.product_name || "").trim(),
    quantity: Number.isFinite(quantityValue) ? quantityValue : 0,
    quantity_unit: String(values.quantity_unit || "kg").trim(),
    packaging_info: String(values.packaging_info || "").trim(),
    pallet_info: String(values.pallet_info || "").trim(),
    vehicle_info: values.vehicle_info ? String(values.vehicle_info).trim() : null,
    dispatch_date: values.dispatch_date ? values.dispatch_date : null,
    notes: values.notes ? String(values.notes).trim() : null,
    status: String(values.status || "hazirlaniyor").trim(),
  };
};

export const formatDispatchDateLabel = (dateValue) => {
  if (!dateValue) return "Planlanmadı";

  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long",
    }).format(new Date(dateValue));
  } catch {
    return dateValue;
  }
};

export const formatQuantityLabel = (quantity, unit) => {
  if (quantity === null || quantity === undefined || quantity === "") return "-";
  return `${quantity} ${unit || ""}`.trim();
};