import { useMemo } from "react";
import { useCurrentUserQuery } from "./useCurrentUserQuery";

export function useCurrentOrganization() {
  const { data: profile, ...rest } = useCurrentUserQuery();

  const organization = useMemo(() => {
    if (!profile?.organizationId) return null;

    return {
      id: profile.organizationId,
      name: profile.organizationName,
      slug: profile.organizationSlug,
    };
  }, [profile]);

  return {
    profile,
    organization,
    ...rest,
  };
}