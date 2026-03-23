export async function getUsersList({ usersRepository }) {
  return usersRepository.getAll();
}