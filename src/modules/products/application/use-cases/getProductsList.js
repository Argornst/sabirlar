export async function getProductsList({ productsRepository }) {
  return productsRepository.getAll();
}