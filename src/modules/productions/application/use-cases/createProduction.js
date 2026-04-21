import { validateCreateProduction } from "../dto/createProductionSchema";

export const createProduction = async ({ productionsRepository, values }) => {
  const result = validateCreateProduction(values);

  if (!result.isValid) {
    const error = new Error("Validation error");
    error.type = "validation";
    error.fields = result.errors;
    throw error;
  }

  return productionsRepository.create(result.payload);
};
