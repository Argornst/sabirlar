export function patchUsersListEntry(oldUsers, userId, patch) {
  if (!Array.isArray(oldUsers)) {
    return oldUsers;
  }

  return oldUsers.map((user) =>
    user.id === userId ? { ...user, ...patch } : user
  );
}
