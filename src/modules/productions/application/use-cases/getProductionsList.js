import { productionsRepository } from '../../infrastructure/repositories/productionsRepository';

export const getProductionsList = async (filters = {}) => {
  return productionsRepository.getList(filters);
};