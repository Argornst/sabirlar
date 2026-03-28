export function formatDate(value) {
  if (!value) return "-";

  const raw = String(value).slice(0, 10);
  const [year, month, day] = raw.split("-");

  if (!year || !month || !day) return "-";

  return `${day}.${month}.${year}`;
}