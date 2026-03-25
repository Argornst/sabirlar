import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../app/providers/AppProviders";
import { getReportsSummary } from "../../application/use-cases/getReportsSummary";
import { salesRepository } from "../../../sales/infrastructure/repositories/salesRepository";
import { productsRepository } from "../../../products/infrastructure/repositories/productsRepository";
import { usersRepository } from "../../../users/infrastructure/repositories/usersRepository";

export function useReportsSummaryQuery() {
  const { isAuthLoading, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["reports-summary"],
    queryFn: () =>
      getReportsSummary({
        salesRepository,
        productsRepository,
        usersRepository,
      }),
    enabled: !isAuthLoading && isAuthenticated,
    retry: 0,
  });
}