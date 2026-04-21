import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { usersQueryKeys } from "../../application/queryKeys";
import { getCurrentUserProfile } from "../../runtime/users.runtime";

export function useCurrentUserQuery() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  return useQuery({
    queryKey: usersQueryKeys.current(user?.id),
    queryFn: async () => {
      if (!user?.id) return null;
      return getCurrentUserProfile(user.id);
    },
    enabled: !isAuthLoading && isAuthenticated && Boolean(user?.id),
    staleTime: 1000 * 60 * 3,
    retry: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });
}
