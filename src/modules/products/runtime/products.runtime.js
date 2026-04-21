import { createProduct } from "../application/use-cases/createProduct";
import { getProductsList } from "../application/use-cases/getProductsList";
import { updateProduct } from "../application/use-cases/updateProduct";
import { productsRepository } from "../infrastructure/repositories/productsRepository";

export function listProducts() {
  return getProductsList({ productsRepository });
}

export function createProductRecord({ values, organizationId }) {
  return createProduct({
    productsRepository,
    values,
    organizationId,
  });
}

export function updateProductRecord({ productId, values }) {
  return updateProduct({
    productsRepository,
    productId,
    values,
  });
}

export function toggleProductRecordActive({ productId, nextIsActive }) {
  return productsRepository.updateActiveStatus(productId, nextIsActive);
}

export async function deleteProductRecord(productId) {
  await productsRepository.remove(productId);
  return true;
}
