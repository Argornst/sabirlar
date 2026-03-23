import { mapCreateProductFormToInsert } from "../mappers/productMappers";

export async function createProduct({
  productsRepository,
  values,
  organizationId,
}) {
  const payload = mapCreateProductFormToInsert(values, organizationId);
  return productsRepository.create(payload);
}