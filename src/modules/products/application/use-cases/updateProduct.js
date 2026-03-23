import { mapUpdateProductFormToPayload } from "../mappers/productMappers";

export async function updateProduct({ productsRepository, productId, values }) {
  const payload = mapUpdateProductFormToPayload(values);
  return productsRepository.update(productId, payload);
}