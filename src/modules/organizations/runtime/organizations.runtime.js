import { organizationsRepository } from "../infrastructure/repositories/organizationsRepository";

export function listOrganizations() {
  return organizationsRepository.getAll();
}
