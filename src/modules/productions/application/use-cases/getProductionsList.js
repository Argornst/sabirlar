export const getProductionsList = async ({ productionsRepository, filters = {} }) => {
  return productionsRepository.getList(filters);
};
