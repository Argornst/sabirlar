export function getOrganizationDisplayName(activeOrganization, profile) {
  if (activeOrganization?.name) {
    return activeOrganization.name;
  }

  if (profile?.organizationName && profile.organizationName !== "-") {
    return profile.organizationName;
  }

  return "Varsayılan Organizasyon";
}

export function getOrganizationDisplaySubtitle(activeOrganization, profile) {
  if (activeOrganization?.slug) {
    return activeOrganization.slug;
  }

  if (profile?.organizationSlug) {
    return profile.organizationSlug;
  }

  return "organization";
}

export function hasActiveOrganization(activeOrganization, profile) {
  return Boolean(activeOrganization?.id || profile?.organizationId);
}