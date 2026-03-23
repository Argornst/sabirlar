export async function getSalesList({ salesRepository }) {
  return salesRepository.getAll();
}