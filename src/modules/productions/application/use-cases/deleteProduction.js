import { productionsRepository } from '../../infrastructure/repositories/productionsRepository';

export const deleteProduction = async (id) => {
  return productionsRepository.remove(id);
};