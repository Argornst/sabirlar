export const logisticsPackagingQueryKeys = {
  all: ['logistics-packaging'] as const,
  products: () => [...logisticsPackagingQueryKeys.all, 'products'] as const,
  materials: () => [...logisticsPackagingQueryKeys.all, 'materials'] as const,
  rules: () => [...logisticsPackagingQueryKeys.all, 'rules'] as const,
  rulesByProduct: (productId: string) =>
    [...logisticsPackagingQueryKeys.rules(), productId] as const,
  calculations: () => [...logisticsPackagingQueryKeys.all, 'calculations'] as const,
  calculation: (id: string) =>
    [...logisticsPackagingQueryKeys.calculations(), id] as const,
  scenarios: () => [...logisticsPackagingQueryKeys.all, 'scenarios'] as const,
};