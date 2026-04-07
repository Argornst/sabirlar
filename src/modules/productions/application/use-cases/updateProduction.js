import { validateUpdateProduction } from '../dto/updateProductionSchema';
import { productionsRepository } from '../../infrastructure/repositories/productionsRepository';

export const updateProduction = async ({ id, values }) => {
  const result = validateUpdateProduction(values);

  if (!result.isValid) {
    const error = new Error('Validation error');
    error.type = 'validation';
    error.fields = result.errors;
    throw error;
  }

  return productionsRepository.update(id, result.payload);
};