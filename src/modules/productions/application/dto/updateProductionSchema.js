import { validateCreateProduction } from './createProductionSchema';

export const validateUpdateProduction = (values) => {
  return validateCreateProduction(values);
};