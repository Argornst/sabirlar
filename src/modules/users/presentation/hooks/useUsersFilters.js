import { useMemo, useState } from "react";

export function useUsersFilters(users = []) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [status, setStatus] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        String(user.fullName || "").toLowerCase().includes(normalizedSearch) ||
        String(user.username || "").toLowerCase().includes(normalizedSearch) ||
        String(user.email || "").toLowerCase().includes(normalizedSearch);

      const matchesRole =
        !role || String(user.roleName || "").toLowerCase() === role.toLowerCase();

      // 🔥 FIX BURASI
      const matchesOrganization =
        !organization ||
        String(user.organizationId ?? "") === String(organization);

      const matchesStatus =
        !status ||
        (status === "active" && user.isActive) ||
        (status === "inactive" && !user.isActive);

      return (
        matchesSearch &&
        matchesRole &&
        matchesOrganization &&
        matchesStatus
      );
    });
  }, [users, search, role, organization, status]);

  const summary = useMemo(() => {
    const total = users.length;
    const active = users.filter((item) => item.isActive).length;
    const inactive = users.filter((item) => !item.isActive).length;

    const byRole = users.reduce((acc, item) => {
      const key = item.roleName || "rol yok";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      byRole,
    };
  }, [users]);

  return {
    search,
    setSearch,
    role,
    setRole,
    organization,
    setOrganization,
    status,
    setStatus,
    filteredUsers,
    summary,
  };
}