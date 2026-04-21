import { validateUpdateProduction } from "../dto/updateProductionSchema";

export const updateProduction = async ({ productionsRepository, id, values }) => {
  const result = validateUpdateProduction(values);

  if (!result.isValid) {
    const error = new Error("Validation error");
    error.type = "validation";
    error.fields = result.errors;
    throw error;
  }

  return productionsRepository.update(id, result.payload);
};
