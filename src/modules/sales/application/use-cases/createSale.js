import { mapCreateSaleFormToInsert } from "../mappers/saleMappers";

export async function createSale({
  salesRepository,
  productsRepository,
  userId,
  organizationId,
  values,
}) {
  const products = await productsRepository.getAll();
  const selectedProduct = products.find(
    (product) => String(product.id) === String(values.productId)
  );

  if (!selectedProduct) {
    throw new Error("Seçilen ürün bulunamadı.");
  }

  const payload = mapCreateSaleFormToInsert(
    values,
    selectedProduct,
    userId,
    organizationId
  );

  return salesRepository.create(payload);
}