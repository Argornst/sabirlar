import { useQuery } from "@tanstack/react-query";
import { organizationsRepository } from "../../infrastructure/repositories/organizationsRepository";

export function useOrganizationsListQuery() {
  return useQuery({
    queryKey: ["organizations-list"],
    queryFn: () => organizationsRepository.getAll(),
  });
}