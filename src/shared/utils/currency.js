export function formatCurrency(value, currency = "TRY", locale = "tr-TR") {
  const amount = Number(value ?? 0);

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}