import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useCurrentUserQuery() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  return useQuery({
    queryKey: ["current-user", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return usersRepository.getProfileByUserId(user.id);
    },
    enabled: !isAuthLoading && isAuthenticated && Boolean(user?.id),
    staleTime: 1000 * 60 * 3,
    retry: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });
}