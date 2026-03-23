import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../../application/use-cases/getDashboardSummary";
import { salesRepository } from "../../../sales/infrastructure/repositories/salesRepository";
import { productsRepository } from "../../../products/infrastructure/repositories/productsRepository";
import { usersRepository } from "../../../users/infrastructure/repositories/usersRepository";

export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () =>
      getDashboardSummary({
        salesRepository,
        productsRepository,
        usersRepository,
      }),
  });
}