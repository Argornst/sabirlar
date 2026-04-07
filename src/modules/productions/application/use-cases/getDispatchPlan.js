import { productionsRepository } from "../../infrastructure/repositories/productionsRepository";

export const getDispatchPlan = async (filters = {}) => {
  return productionsRepository.getDispatchPlan(filters);
};