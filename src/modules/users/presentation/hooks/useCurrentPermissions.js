import { useMemo } from "react";
import { getSafePagePermissions } from "../../../../shared/lib/permissions";
import { useCurrentUserQuery } from "./useCurrentUserQuery";

export function useCurrentPermissions() {
  const { data: profile, ...rest } = useCurrentUserQuery();

  const permissions = useMemo(
    () => getSafePagePermissions(profile),
    [profile]
  );

  return {
    profile,
    permissions,
    ...rest,
  };
}