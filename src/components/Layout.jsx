import { NavLink, Outlet } from "react-router-dom";

const linkBase = {
  display: "block",
  padding: "12px 14px",
  borderRadius: "12px",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "700",
  marginBottom: "8px",
};

export default function Layout({ session, profile, onLogout }) {
  const roleName = profile?.roles?.name || "-";
  const isAdmin = roleName === "admin";

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.logoBadge}>Satış Sistemi</div>
          <h2 style={styles.sidebarTitle}>Yönetim Paneli</h2>
          <p style={styles.sidebarText}>{profile?.full_name || session?.user?.email}</p>
          <p style={styles.sidebarRole}>Rol: {roleName}</p>
        </div>

        <nav style={{ marginTop: 24 }}>
          <NavItem to="/">Dashboard</NavItem>
          <NavItem to="/sales">Satışlar</NavItem>
          <NavItem to="/new-sale">Yeni Satış</NavItem>
          <NavItem to="/products">Ürünler</NavItem>
          {isAdmin && <NavItem to="/price-management">Fiyat Yönetimi</NavItem>}
          <NavItem to="/reports">Raporlar</NavItem>
        </nav>

        <button onClick={onLogout} style={styles.logoutButton}>
          Çıkış Yap
        </button>
      </aside>

      <main style={styles.main}>
        <Outlet context={{ session, profile }} />
      </main>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...linkBase,
        background: isActive ? "#111827" : "#f3f4f6",
        color: isActive ? "#ffffff" : "#111827",
      })}
    >
      {children}
    </NavLink>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    background: "#f3f4f6",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#111827",
  },
  sidebar: {
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logoBadge: {
    display: "inline-block",
    background: "#dcfce7",
    color: "#166534",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "12px",
  },
  sidebarTitle: {
    margin: "0 0 8px 0",
    fontSize: "24px",
  },
  sidebarText: {
    margin: "0 0 6px 0",
    color: "#374151",
    fontSize: "14px",
  },
  sidebarRole: {
    margin: 0,
    color: "#6b7280",
    fontSize: "13px",
  },
  logoutButton: {
    marginTop: "24px",
    background: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
  main: {
    padding: "24px",
  },
};