export const getDispatchPlan = async ({ productionsRepository, filters = {} }) => {
  return productionsRepository.getDispatchPlan(filters);
};
