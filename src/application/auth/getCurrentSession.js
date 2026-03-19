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

  if (!profile?.is_active) {
    await authRepository.signOut();

    return {
      session: null,
      profile: null,
    };
  }

  return {
    session,
    profile,
  };
}