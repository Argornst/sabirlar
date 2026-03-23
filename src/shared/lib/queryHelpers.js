export function buildSelect(columns) {
  return columns.join(", ");
}

export function safeArray(data) {
  return Array.isArray(data) ? data : [];
}