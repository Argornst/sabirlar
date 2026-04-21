import { authRepository } from "../infrastructure/authRepository";

export function resolveLoginIdentity(login) {
  return authRepository.resolveLogin(login);
}

export function signInWithCredentials({ email, password }) {
  return authRepository.signInWithPassword({
    email,
    password,
  });
}

export function signOutCurrentUser() {
  return authRepository.signOut();
}

export function getCurrentSession() {
  return authRepository.getSession();
}

export function getCurrentAuthUser() {
  return authRepository.getUser();
}
