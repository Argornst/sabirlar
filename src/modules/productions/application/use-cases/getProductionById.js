export const getProductionById = async ({ productionsRepository, id }) => {
  return productionsRepository.getById(id);
};
