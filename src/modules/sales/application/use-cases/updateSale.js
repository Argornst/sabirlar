import { mapUpdateSaleFormToPayload } from "../mappers/saleMappers";

export async function updateSale({
  salesRepository,
  sale,
  userId,
  values,
}) {
  if (!sale?.id) {
    throw new Error("Güncellenecek satış bulunamadı.");
  }

  const payload = mapUpdateSaleFormToPayload(values, sale, userId);

  return salesRepository.update(sale.id, payload);
}