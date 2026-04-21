import { createSale } from "../application/use-cases/createSale";
import { getSalesList } from "../application/use-cases/getSalesList";
import { updateSale } from "../application/use-cases/updateSale";
import { salesRepository } from "../infrastructure/repositories/salesRepository";
import { productsRepository } from "../../products/infrastructure/repositories/productsRepository";

export function listSales() {
  return getSalesList({ salesRepository });
}

export function createSaleRecord({ userId, organizationId, values }) {
  return createSale({
    salesRepository,
    productsRepository,
    userId,
    organizationId,
    values,
  });
}

export function updateSaleRecord({ userId, sale, values }) {
  return updateSale({
    salesRepository,
    productsRepository,
    userId,
    sale,
    values,
  });
}

export async function deleteSaleRecord(saleId) {
  if (saleId == null || saleId === "") {
    throw new Error("Silinecek sipariş ID bilgisi bulunamadı.");
  }

  await salesRepository.remove(saleId);
}

export function updateSaleRecordStatus({ saleId, nextStatus, actorUserId }) {
  return salesRepository.updateStatus(saleId, nextStatus, actorUserId);
}
