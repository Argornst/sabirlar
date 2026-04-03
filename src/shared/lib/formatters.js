export function getRoleTone(role) {
  if (!role) return "default";

  const map = {
    admin: "danger",
    satis: "warning",
    operasyon: "default",
  };

  return map[role.toLowerCase()] || "default";
}

export function formatRoleName(roleName) {
  if (!roleName) return "Rol Yok";

  const map = {
    admin: "Yönetici",
    satis: "Satış",
    operasyon: "Operasyon",
  };

  return map[roleName.toLowerCase()] || roleName;
}