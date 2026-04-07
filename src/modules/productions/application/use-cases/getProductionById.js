import { productionsRepository } from '../../infrastructure/repositories/productionsRepository';

export const getProductionById = async (id) => {
  return productionsRepository.getById(id);
};