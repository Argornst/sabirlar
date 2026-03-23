import { useQuery } from "@tanstack/react-query";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useOrganizationsQuery() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => usersRepository.listOrganizations(),
  });
}