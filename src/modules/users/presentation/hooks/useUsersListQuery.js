import { useQuery } from "@tanstack/react-query";
import { getUsersList } from "../../application/use-cases/getUsersList";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export function useUsersListQuery() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => getUsersList({ usersRepository }),
  });
}