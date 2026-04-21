import { createUser } from "../application/use-cases/createUser";
import { getUsersList } from "../application/use-cases/getUsersList";
import { usersRepository } from "../infrastructure/repositories/usersRepository";

export function listUsers() {
  return getUsersList({ usersRepository });
}

export function createUserRecord(values) {
  return createUser({
    usersRepository,
    values,
  });
}

export function getCurrentUserProfile(userId) {
  return usersRepository.getProfileByUserId(userId);
}

export function listAvailableOrganizations() {
  return usersRepository.listOrganizations();
}

export function listAvailableRoles() {
  return usersRepository.listRoles();
}

export function updateUserPagePermissions({ userId, pagePermissions }) {
  return usersRepository.updatePagePermissions(userId, pagePermissions);
}

export function updateUserActiveStatus({ userId, nextIsActive }) {
  return usersRepository.updateActiveStatus(userId, nextIsActive);
}

export function updateUserRoleRecord({ userId, roleId }) {
  return usersRepository.updateRole(userId, roleId);
}

export function updateUserOrganizationRecord({ userId, organizationId }) {
  return usersRepository.updateOrganization(userId, organizationId);
}
