function normalizeSearchText(value = "") {
  return value
    .toString()
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, " ");
}

export function createProductionProductOption(value, overrides = {}) {
  const normalizedValue = value?.toString().trim() || "";

  return {
    id:
      overrides.id ||
      normalizedValue
        .toLocaleLowerCase("tr-TR")
        .replace(/\s+/g, "-")
        .replace(/[^\w-çğıöşü]/gi, ""),
    label: overrides.label || normalizedValue,
    value: overrides.value || normalizedValue,
    keywords: Array.isArray(overrides.keywords) ? overrides.keywords : [],
    group: overrides.group || "",
    disabled: Boolean(overrides.disabled),
  };
}

export function normalizeProductOptions(items = []) {
  return items
    .filter(Boolean)
    .map((item) => {
      if (typeof item === "string") {
        return createProductionProductOption(item);
      }

      return createProductionProductOption(item.value || item.label || "", item);
    })
    .filter((item) => item.value);
}

export function filterProductionProductOptions(options = [], query = "") {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) return options;

  return options.filter((option) => {
    const searchableFields = [
      option.label,
      option.value,
      option.group,
      ...(option.keywords || []),
    ]
      .filter(Boolean)
      .map((entry) => normalizeSearchText(entry));

    return searchableFields.some((field) => field.includes(normalizedQuery));
  });
}