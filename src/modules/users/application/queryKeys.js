function hasUsersRoot(query) {
  return Array.isArray(query?.queryKey) && query.queryKey.includes("users");
}

export const usersQueryKeys = {
  all: ["users"],
  currentRoot: ["current-user"],
  current: (userId) => ["current-user", userId],
  organizations: ["organizations"],
  roles: ["roles"],
};

export async function invalidateUsersListQueries(queryClient) {
  await queryClient.invalidateQueries({
    predicate: hasUsersRoot,
  });
}

export async function invalidateUserProfileQueries(queryClient) {
  await queryClient.invalidateQueries({
    queryKey: usersQueryKeys.currentRoot,
  });
}

export async function invalidateUserAccessQueries(queryClient) {
  await Promise.all([
    invalidateUsersListQueries(queryClient),
    invalidateUserProfileQueries(queryClient),
  ]);
}

export async function invalidateUserManagementQueries(
  queryClient,
  { includeOrganizations = false, includeAudit = false } = {}
) {
  const tasks = [
    invalidateUsersListQueries(queryClient),
    invalidateUserProfileQueries(queryClient),
  ];

  if (includeOrganizations) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.organizations,
      })
    );
  }

  if (includeAudit) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: ["audit-logs"],
      })
    );
  }

  await Promise.all(tasks);
}
