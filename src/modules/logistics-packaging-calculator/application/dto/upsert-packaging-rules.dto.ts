export interface UpsertPackagingRulesDto {
  productId: string;
  rules: Array<{
    materialId: string;
    isRequired: boolean;
  }>;
}