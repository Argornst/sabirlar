import { mapCreateUserFormToPayload } from "../mappers/userMappers";

export async function createUser({ usersRepository, values }) {
  const roles = await usersRepository.listRoles();

  const selectedRole = roles.find(
    (role) => String(role.id) === String(values.roleId)
  );

  if (!selectedRole) {
    throw new Error("Seçilen rol bulunamadı.");
  }

  const payload = mapCreateUserFormToPayload(values, selectedRole);
  return usersRepository.create(payload);
}