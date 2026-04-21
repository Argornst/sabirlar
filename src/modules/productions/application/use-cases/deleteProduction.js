export const deleteProduction = async ({ productionsRepository, id }) => {
  return productionsRepository.remove(id);
};
