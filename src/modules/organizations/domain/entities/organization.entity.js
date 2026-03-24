export function normalizeOrganization(raw) {
  if (!raw) return null;

  return {
    id: raw.id ?? null,
    name: raw.name ?? "-",
    slug: raw.slug ?? null,
    isActive: raw.is_active ?? true,
    createdAt: raw.created_at ?? null,
  };
}