import { useQuery } from "@tanstack/react-query";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useRolesQuery() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => usersRepository.listRoles(),
  });
}