import { authRepository } from "../../infrastructure/repositories/authRepository";
import { usersRepository } from "../../infrastructure/repositories/usersRepository";

export async function getCurrentSession() {
  const session = await authRepository.getSession();

  if (!session?.user?.id) {
    return {
      session: null,
      profile: null,
    };
  }

  const profile = await usersRepository.getProfileByUserId(session.user.id);

  return {
    session,
    profile,
  };
}