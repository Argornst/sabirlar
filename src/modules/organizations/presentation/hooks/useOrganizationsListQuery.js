import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { organizationsRepository } from "../../infrastructure/repositories/organizationsRepository";

export function useOrganizationsListQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["organizations-list"],
    queryFn: () => organizationsRepository.getAll(),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
  });
}