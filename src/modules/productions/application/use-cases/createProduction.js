import { validateCreateProduction } from '../dto/createProductionSchema';
import { productionsRepository } from '../../infrastructure/repositories/productionsRepository';

export const createProduction = async (values) => {
  const result = validateCreateProduction(values);

  if (!result.isValid) {
    const error = new Error('Validation error');
    error.type = 'validation';
    error.fields = result.errors;
    throw error;
  }

  return productionsRepository.create(result.payload);
};