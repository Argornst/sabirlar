import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { usersRepository } from "../../../users/infrastructure/repositories/usersRepository";

export function useOrganizationsListQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => usersRepository.listOrganizations(),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
  });
}