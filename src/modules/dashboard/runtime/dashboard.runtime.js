import { dashboardRepository } from "../infrastructure/repositories/dashboardRepository";

export function getDashboardSummarySnapshot() {
  return dashboardRepository.getSummary();
}
