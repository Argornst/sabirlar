import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { usersRepository } from "../infrastructure/repositories/usersRepository";
import { adminUsersRepository } from "../infrastructure/repositories/adminUsersRepository";
import { useToast } from "../presentation/hooks/useToast";
import AppPage from "../presentation/components/ui/AppPage";
import PageHero from "../presentation/components/ui/PageHero";
import {
  DEFAULT_PAGE_PERMISSIONS,
  buildDefaultStaffPermissions,
  buildFullAccessPermissions,
  isAdminProfile,
} from "../shared/constants/permissions";

const PAGE_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "sales", label: "Satışlar" },
  { key: "new_sale", label: "Yeni Satış" },
  { key: "products", label: "Ürünler" },
  { key: "reports", label: "Raporlar" },
  { key: "users", label: "Kullanıcı Yönetimi" },
];

function buildInitialCreateForm(defaultRoleName = "") {
  return {
    full_name: "",
    username: "",
    email: "",
    password: "",
    role_id: "",
    is_active: true,
    page_permissions:
      String(defaultRoleName).toLowerCase() === "admin"
        ? buildFullAccessPermissions()
        : buildDefaultStaffPermissions(),
  };
}

function buildEditForm(user) {
  return {
    id: user.id,
    full_name: user.full_name || "",
    username: user.username || "",
    email: user.email || "",
    role_id: user.role_id || "",
    is_active: Boolean(user.is_active),
    page_permissions: {
      ...DEFAULT_PAGE_PERMISSIONS,
      ...(user.page_permissions || {}),
    },
  };
}

function normalizeUsername(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 24);
}

function getDefaultRole(roles) {
  return roles.find((r) => String(r.name).toLowerCase() !== "admin") || roles[0] || null;
}

export default function UsersPage() {
  const outletContext = useOutletContext() || {};
  const { profile } = outletContext;
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState({});
  const [query, setQuery] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(buildInitialCreateForm());

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const resolvedRoleName = useMemo(() => {
    return String(
      profile?.roles?.name ||
        profile?.role_name ||
        profile?.role?.name ||
        profile?.user_role?.name ||
        ""
    ).toLowerCase();
  }, [profile]);

  const isAdmin = useMemo(() => {
    return (
      isAdminProfile(profile) ||
      profile?.page_permissions?.users === true ||
      profile?.permissions?.users === true ||
      resolvedRoleName.includes("admin") ||
      resolvedRoleName.includes("yönetici") ||
      resolvedRoleName.includes("yonetici")
    );
  }, [profile, resolvedRoleName]);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    try {
      setLoading(true);

      const [usersData, rolesData] = await Promise.all([
        usersRepository.listUsers(),
        usersRepository.listRoles(),
      ]);

      setUsers(usersData);
      setRoles(rolesData);

      const defaultRole = getDefaultRole(rolesData);

      setCreateForm((prev) => {
        if (prev.role_id) return prev;
        return {
          ...buildInitialCreateForm(defaultRole?.name || ""),
          role_id: defaultRole?.id || "",
        };
      });
    } catch (error) {
      toast.error(
        "Kullanıcılar alınamadı",
        error?.message || "Beklenmeyen bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  function closeCreateModal() {
    const defaultRole = getDefaultRole(roles);
    setCreateOpen(false);
    setCreateForm({
      ...buildInitialCreateForm(defaultRole?.name || ""),
      role_id: defaultRole?.id || "",
    });
  }

  function closeEditModal() {
    setEditOpen(false);
    setEditForm(null);
  }

  async function patchUser(userId, updates) {
    const previousUsers = users;

    setSavingMap((prev) => ({ ...prev, [userId]: true }));
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...updates,
              page_permissions: updates.page_permissions
                ? {
                    ...DEFAULT_PAGE_PERMISSIONS,
                    ...user.page_permissions,
                    ...updates.page_permissions,
                  }
                : user.page_permissions,
            }
          : user
      )
    );

    try {
      const updated = await usersRepository.updateUserAccess(userId, updates);

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updated : user))
      );

      return updated;
    } catch (error) {
      setUsers(previousUsers);
      throw error;
    } finally {
      setSavingMap((prev) => ({ ...prev, [userId]: false }));
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();

    try {
      setCreating(true);

      const payload = {
        full_name: createForm.full_name.trim(),
        username: normalizeUsername(createForm.username),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        role_id: Number(createForm.role_id),
        is_active: Boolean(createForm.is_active),
        page_permissions: createForm.page_permissions,
      };

      if (
        !payload.full_name ||
        !payload.username ||
        !payload.email ||
        !payload.password ||
        !payload.role_id
      ) {
        throw new Error("Tüm zorunlu alanları doldur.");
      }

      if (payload.username.length < 3) {
        throw new Error("Kullanıcı adı en az 3 karakter olmalı.");
      }

      await adminUsersRepository.createUser(payload);

      toast.success("Kullanıcı oluşturuldu", "Yeni kullanıcı başarıyla eklendi.");
      closeCreateModal();
      await loadPage();
    } catch (error) {
      toast.error(
        "Kullanıcı oluşturulamadı",
        error?.message || "Beklenmeyen bir hata oluştu."
      );
    } finally {
      setCreating(false);
    }
  }

  function openEditModal(user) {
    setEditForm(buildEditForm(user));
    setEditOpen(true);
  }

  async function handleEditUser(e) {
    e.preventDefault();

    try {
      setEditing(true);

      const payload = {
        full_name: editForm.full_name.trim(),
        username: normalizeUsername(editForm.username),
        email: editForm.email.trim().toLowerCase(),
        role_id: Number(editForm.role_id),
        is_active: Boolean(editForm.is_active),
        page_permissions: editForm.page_permissions,
      };

      if (!payload.full_name || !payload.username || !payload.email || !payload.role_id) {
        throw new Error("Tüm zorunlu alanları doldur.");
      }

      if (payload.username.length < 3) {
        throw new Error("Kullanıcı adı en az 3 karakter olmalı.");
      }

      await patchUser(editForm.id, payload);

      toast.success("Kullanıcı güncellendi", "Değişiklikler kaydedildi.");
      closeEditModal();
    } catch (error) {
      toast.error(
        "Güncelleme başarısız",
        error?.message || "Değişiklik kaydedilemedi."
      );
    } finally {
      setEditing(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) => {
      const fullName = String(user.full_name || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const username = String(user.username || "").toLowerCase();
      const roleName = String(user.roles?.name || "").toLowerCase();

      return (
        fullName.includes(q) ||
        email.includes(q) ||
        username.includes(q) ||
        roleName.includes(q)
      );
    });
  }, [users, query]);

  if (!isAdmin) {
    return (
      <div style={styles.page}>
        <div style={styles.emptyCard}>
          <div style={styles.emptyTitle}>Bu alan sadece admin için açık.</div>
          <div style={styles.emptyText}>
            Kullanıcı yönetimi ve sayfa erişim kontrolü için admin yetkisi gerekli.
          </div>
          <div style={styles.debugText}>
            Debug role: {resolvedRoleName || "rol bulunamadı"}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.headerCard}>
          <div style={styles.title}>Kullanıcı Yönetimi</div>
          <div style={styles.subtitle}>Yetkiler yükleniyor...</div>
        </div>

        <div style={styles.loadingCard}>
          <div style={styles.loaderOrb} />
        </div>
      </div>
    );
  }

  return (
    <AppPage
      hero={
        <PageHero
          kicker="Admin Control"
          title="Kullanıcı Yönetimi"
          subtitle="Kullanıcıları oluştur, düzenle, pasife al ve sayfa yetkilerini yönet."
          variant="blue"
          rightContent={
            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => setCreateOpen(true)}
            >
              + Yeni Kullanıcı
            </button>
          }
        />
      }
    >
      <div style={styles.toolbar}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad, username, e-posta veya rol ara..."
          style={styles.searchInput}
        />
      </div>

      <div style={styles.tableWrap}>
        <div style={styles.tableHeader}>
          <div style={{ ...styles.colUser, ...styles.headerText }}>Kullanıcı</div>
          <div style={{ ...styles.colRole, ...styles.headerText }}>Rol</div>
          <div style={{ ...styles.colStatus, ...styles.headerText }}>Durum</div>
          <div style={{ ...styles.colActions, ...styles.headerText }}>İşlem</div>
        </div>

        <div style={styles.rows}>
          {filteredUsers.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              saving={Boolean(savingMap[user.id])}
              onToggleActive={async () => {
                try {
                  await patchUser(user.id, { is_active: !user.is_active });
                  toast.success("Kaydedildi", "Kullanıcı durumu güncellendi.");
                } catch (error) {
                  toast.error(
                    "Güncelleme başarısız",
                    error?.message || "Değişiklik kaydedilemedi."
                  );
                }
              }}
              onOpenEdit={() => openEditModal(user)}
            />
          ))}
        </div>
      </div>

      {createOpen ? (
        <div
          style={styles.modalOverlay}
          onClick={() => !creating && closeCreateModal()}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Yeni Kullanıcı Oluştur</div>
            <div style={styles.modalSubtitle}>
              Kullanıcı adı ile giriş yapacak yeni bir hesap oluştur.
            </div>

            <form onSubmit={handleCreateUser} style={styles.modalForm}>
              <div style={styles.sectionTitle}>Temel Bilgiler</div>

              <div style={styles.formGrid}>
                <Field label="Ad Soyad">
                  <input
                    style={styles.input}
                    placeholder="Ad Soyad"
                    autoComplete="name"
                    value={createForm.full_name}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="Kullanıcı Adı">
                  <input
                    style={styles.input}
                    placeholder="ornek: asahin"
                    autoComplete="username"
                    value={createForm.username}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        username: normalizeUsername(e.target.value),
                      }))
                    }
                  />
                </Field>

                <Field label="E-posta">
                  <input
                    style={styles.input}
                    placeholder="ornek@mail.com"
                    type="email"
                    autoComplete="username"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="Şifre">
                  <input
                    style={styles.input}
                    placeholder="Şifre gir"
                    type="password"
                    autoComplete="new-password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="Rol">
                  <select
                    style={styles.input}
                    value={createForm.role_id}
                    onChange={(e) =>
                      setCreateForm((prev) => {
                        const nextRoleId = e.target.value;
                        const selectedRole = roles.find(
                          (role) => Number(role.id) === Number(nextRoleId)
                        );
                        const roleName = String(selectedRole?.name || "").toLowerCase();

                        return {
                          ...prev,
                          role_id: nextRoleId,
                          page_permissions:
                            roleName === "admin"
                              ? buildFullAccessPermissions()
                              : prev.page_permissions,
                        };
                      })
                    }
                  >
                    <option value="">Rol seç</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Durum">
                  <button
                    type="button"
                    style={{
                      ...styles.statusButton,
                      ...(createForm.is_active
                        ? styles.statusActive
                        : styles.statusPassive),
                    }}
                    onClick={() =>
                      setCreateForm((prev) => ({
                        ...prev,
                        is_active: !prev.is_active,
                      }))
                    }
                  >
                    {createForm.is_active ? "Aktif" : "Pasif"}
                  </button>
                </Field>
              </div>

              <div style={styles.sectionTitle}>Sayfa Yetkileri</div>

              <div style={styles.permissionGrid}>
                {PAGE_ITEMS.map((item) => {
                  const checked = Boolean(createForm.page_permissions[item.key]);
                  const selectedRole = roles.find(
                    (role) => Number(role.id) === Number(createForm.role_id)
                  );
                  const roleName = String(selectedRole?.name || "").toLowerCase();
                  const isRoleAdmin = roleName === "admin";

                  return (
                    <label key={item.key} style={styles.permissionItem}>
                      <span style={styles.permissionLabel}>{item.label}</span>

                      <button
                        type="button"
                        disabled={isRoleAdmin}
                        onClick={() =>
                          setCreateForm((prev) => ({
                            ...prev,
                            page_permissions: {
                              ...prev.page_permissions,
                              [item.key]: !checked,
                            },
                          }))
                        }
                        style={{
                          ...styles.toggle,
                          ...(checked ? styles.toggleOn : styles.toggleOff),
                          ...(isRoleAdmin ? styles.toggleLocked : {}),
                        }}
                        title={isRoleAdmin ? "Admin rolü tüm sayfaları görür." : ""}
                      >
                        <span
                          style={{
                            ...styles.toggleThumb,
                            transform: checked
                              ? "translateX(20px)"
                              : "translateX(0)",
                          }}
                        />
                      </button>
                    </label>
                  );
                })}
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={closeCreateModal}
                  disabled={creating}
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  style={styles.primaryButton}
                  disabled={creating}
                >
                  {creating ? "Oluşturuluyor..." : "Kullanıcıyı Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editOpen && editForm ? (
        <div
          style={styles.modalOverlay}
          onClick={() => !editing && closeEditModal()}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Kullanıcıyı Düzenle</div>
            <div style={styles.modalSubtitle}>
              Profil bilgilerini, rolü ve sayfa erişimlerini güncelle.
            </div>

            <form onSubmit={handleEditUser} style={styles.modalForm}>
              <div style={styles.sectionTitle}>Temel Bilgiler</div>

              <div style={styles.formGrid}>
                <Field label="Ad Soyad">
                  <input
                    style={styles.input}
                    autoComplete="name"
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="Kullanıcı Adı">
                  <input
                    style={styles.input}
                    autoComplete="username"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        username: normalizeUsername(e.target.value),
                      }))
                    }
                  />
                </Field>

                <Field label="E-posta">
                  <input
                    style={styles.input}
                    type="email"
                    autoComplete="username"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="Rol">
                  <select
                    style={styles.input}
                    value={editForm.role_id}
                    onChange={(e) =>
                      setEditForm((prev) => {
                        const nextRoleId = e.target.value;
                        const selectedRole = roles.find(
                          (role) => Number(role.id) === Number(nextRoleId)
                        );
                        const roleName = String(selectedRole?.name || "").toLowerCase();

                        return {
                          ...prev,
                          role_id: nextRoleId,
                          page_permissions:
                            roleName === "admin"
                              ? buildFullAccessPermissions()
                              : prev.page_permissions,
                        };
                      })
                    }
                  >
                    <option value="">Rol seç</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Durum">
                  <button
                    type="button"
                    style={{
                      ...styles.statusButton,
                      ...(editForm.is_active
                        ? styles.statusActive
                        : styles.statusPassive),
                    }}
                    onClick={() =>
                      setEditForm((prev) => ({
                        ...prev,
                        is_active: !prev.is_active,
                      }))
                    }
                  >
                    {editForm.is_active ? "Aktif" : "Pasif"}
                  </button>
                </Field>
              </div>

              <div style={styles.sectionTitle}>Sayfa Yetkileri</div>

              <div style={styles.permissionGrid}>
                {PAGE_ITEMS.map((item) => {
                  const checked = Boolean(editForm.page_permissions[item.key]);
                  const selectedRole = roles.find(
                    (role) => Number(role.id) === Number(editForm.role_id)
                  );
                  const roleName = String(selectedRole?.name || "").toLowerCase();
                  const isRoleAdmin = roleName === "admin";

                  return (
                    <label key={item.key} style={styles.permissionItem}>
                      <span style={styles.permissionLabel}>{item.label}</span>

                      <button
                        type="button"
                        disabled={isRoleAdmin}
                        onClick={() =>
                          setEditForm((prev) => ({
                            ...prev,
                            page_permissions: {
                              ...prev.page_permissions,
                              [item.key]: !checked,
                            },
                          }))
                        }
                        style={{
                          ...styles.toggle,
                          ...(checked ? styles.toggleOn : styles.toggleOff),
                          ...(isRoleAdmin ? styles.toggleLocked : {}),
                        }}
                        title={isRoleAdmin ? "Admin rolü tüm sayfaları görür." : ""}
                      >
                        <span
                          style={{
                            ...styles.toggleThumb,
                            transform: checked
                              ? "translateX(20px)"
                              : "translateX(0)",
                          }}
                        />
                      </button>
                    </label>
                  );
                })}
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={closeEditModal}
                  disabled={editing}
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  style={styles.primaryButton}
                  disabled={editing}
                >
                  {editing ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AppPage>
  );
}

function UserRow({ user, saving, onToggleActive, onOpenEdit }) {
  return (
    <div style={styles.row}>
      <div style={styles.colUser}>
        <div style={styles.userName}>{user.full_name || "-"}</div>
        <div style={styles.userSub}>@{user.username || "-"}</div>
        <div style={styles.userEmail}>{user.email}</div>
      </div>

      <div style={styles.colRole}>
        <div style={styles.roleBadge}>{user.roles?.name || "-"}</div>
      </div>

      <div style={styles.colStatus}>
        <button
          type="button"
          onClick={onToggleActive}
          style={{
            ...styles.statusButton,
            ...(user.is_active ? styles.statusActive : styles.statusPassive),
          }}
          disabled={saving}
        >
          {user.is_active ? "Aktif" : "Pasif"}
        </button>
      </div>

      <div style={styles.colActions}>
        <button
          type="button"
          onClick={onOpenEdit}
          style={styles.editButton}
          disabled={saving}
        >
          Düzenle
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabel}>{label}</div>
      {children}
    </div>
  );
}

const glass = {
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(255,255,255,0.55)",
  backdropFilter: "blur(18px)",
  boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
};

const styles = {
  page: {
    display: "grid",
    gap: "20px",
  },
  toolbar: {
    ...glass,
    borderRadius: "24px",
    padding: "16px",
  },
  searchInput: {
    width: "100%",
    border: "1px solid rgba(148,163,184,0.22)",
    background: "rgba(255,255,255,0.76)",
    borderRadius: "18px",
    padding: "14px 16px",
    fontSize: "14px",
    outline: "none",
    color: "#0f172a",
  },
  tableWrap: {
    ...glass,
    borderRadius: "28px",
    overflow: "hidden",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1.4fr 180px 140px 160px",
    gap: "16px",
    padding: "18px 20px",
    borderBottom: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(255,255,255,0.42)",
  },
  headerText: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  rows: {
    display: "grid",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1.4fr 180px 140px 160px",
    gap: "16px",
    padding: "20px",
    borderBottom: "1px solid rgba(148,163,184,0.14)",
    alignItems: "center",
    background: "rgba(255,255,255,0.18)",
  },
  colUser: {
    minWidth: 0,
  },
  colRole: {},
  colStatus: {},
  colActions: {
    display: "flex",
    justifyContent: "flex-start",
  },
  userName: {
    color: "#0f172a",
    fontSize: "15px",
    fontWeight: 800,
    marginBottom: "4px",
  },
  userSub: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "4px",
  },
  userEmail: {
    color: "#64748b",
    fontSize: "13px",
  },
  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.58)",
    border: "1px solid rgba(148,163,184,0.16)",
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: 800,
  },
  editButton: {
    border: "1px solid rgba(148,163,184,0.24)",
    borderRadius: "14px",
    padding: "11px 14px",
    background: "rgba(255,255,255,0.82)",
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
  },
  statusButton: {
    minWidth: "100px",
    border: "none",
    borderRadius: "999px",
    padding: "11px 14px",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  statusActive: {
    background: "rgba(16,185,129,0.14)",
    color: "#047857",
  },
  statusPassive: {
    background: "rgba(239,68,68,0.14)",
    color: "#b91c1c",
  },
  permissionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px 16px",
  },
  permissionItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 14px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.54)",
    border: "1px solid rgba(148,163,184,0.14)",
  },
  permissionLabel: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: 700,
  },
  toggle: {
    width: "46px",
    height: "26px",
    borderRadius: "999px",
    border: "none",
    padding: "3px",
    position: "relative",
    cursor: "pointer",
    transition: "all 180ms ease",
  },
  toggleOn: {
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
  },
  toggleOff: {
    background: "rgba(148,163,184,0.38)",
  },
  toggleLocked: {
    opacity: 0.75,
    cursor: "not-allowed",
  },
  toggleThumb: {
    width: "20px",
    height: "20px",
    borderRadius: "999px",
    background: "#fff",
    display: "block",
    transition: "transform 180ms ease",
    boxShadow: "0 4px 12px rgba(15,23,42,0.18)",
  },
  loadingCard: {
    ...glass,
    borderRadius: "28px",
    minHeight: "360px",
    display: "grid",
    placeItems: "center",
  },
  loaderOrb: {
    width: "72px",
    height: "72px",
    borderRadius: "999px",
    background:
      "conic-gradient(from 0deg, rgba(16,185,129,0.18), rgba(59,130,246,0.95), rgba(255,255,255,0.18))",
    filter: "blur(0.2px)",
    animation: "spin 1s linear infinite",
  },
  headerCard: {
    ...glass,
    borderRadius: "28px",
    padding: "24px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    lineHeight: 1.05,
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    margin: "10px 0 0 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  emptyCard: {
    ...glass,
    borderRadius: "28px",
    padding: "24px",
  },
  emptyTitle: {
    color: "#0f172a",
    fontSize: "20px",
    fontWeight: 900,
    marginBottom: "8px",
  },
  emptyText: {
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  debugText: {
    marginTop: "10px",
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: 1.6,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,0.50)",
    backdropFilter: "blur(8px)",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    zIndex: 1000,
  },
  modal: {
    width: "100%",
    maxWidth: "920px",
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(255,255,255,0.6)",
    borderRadius: "28px",
    boxShadow: "0 30px 80px rgba(15,23,42,0.18)",
    padding: "24px",
  },
  modalTitle: {
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: 900,
    marginBottom: "8px",
  },
  modalSubtitle: {
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "18px",
  },
  modalForm: {
    display: "grid",
    gap: "18px",
  },
  sectionTitle: {
    color: "#334155",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },
  field: {
    display: "grid",
    gap: "8px",
  },
  fieldLabel: {
    color: "#475569",
    fontSize: "12px",
    fontWeight: 800,
  },
  input: {
    width: "100%",
    borderRadius: "14px",
    border: "1px solid rgba(148,163,184,0.22)",
    background: "rgba(255,255,255,0.86)",
    padding: "12px 14px",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  primaryButton: {
    border: "none",
    borderRadius: "16px",
    padding: "14px 18px",
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid rgba(148,163,184,0.24)",
    borderRadius: "16px",
    padding: "14px 18px",
    background: "rgba(255,255,255,0.8)",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },
};