export function getProductionProductOptions({ productOptions = [] } = {}) {
  return Array.isArray(productOptions) ? productOptions : [];
}
