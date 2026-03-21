import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../../shared/constants/routes";
import { ROLES } from "../../shared/constants/roles";

const navItems = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", icon: "◫" },
  { to: ROUTES.SALES, label: "Satışlar", icon: "▤" },
  { to: ROUTES.NEW_SALE, label: "Yeni Satış", icon: "+" },
  { to: ROUTES.PRODUCTS, label: "Ürünler", icon: "◈" },
  { to: ROUTES.REPORTS, label: "Raporlar", icon: "◭" },
  { to: ROUTES.USERS, label: "Kullanıcılar", icon: "◎", adminOnly: true },
];

export default function AppShell({
  session,
  profile,
  onLogout,
  refreshing = false,
}) {
  const roleName = profile?.roles?.name || "-";
  const isAdmin = roleName === ROLES.ADMIN;
  const fullName = profile?.full_name || session?.user?.email || "Kullanıcı";

  return (
    <div style={styles.app}>
      {refreshing && (
        <div style={styles.topProgressTrack}>
          <div style={styles.topProgressBar} />
        </div>
      )}

      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />

      <div style={styles.grid}>
        <aside style={styles.sidebar}>
          <div>
            <div style={styles.brand}>
              <div style={styles.brandIcon}>S</div>

              <div>
                <div style={styles.brandTitle}>SABIRLAR</div>
                <div style={styles.brandSubtitle}>Perakende Satışlar</div>
              </div>
            </div>

            <div style={styles.profileCard}>
              <div style={styles.avatar}>
                {String(fullName).charAt(0).toUpperCase()}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={styles.profileName}>{fullName}</div>
                <div style={styles.profileRole}>Rol: {roleName}</div>
              </div>

              <div style={styles.liveDot} />
            </div>

            <nav style={styles.nav}>
              {navItems
                .filter((item) => !item.adminOnly || isAdmin)
                .map((item) => (
                  <NavItem key={item.to} to={item.to} icon={item.icon}>
                    {item.label}
                  </NavItem>
                ))}
            </nav>
          </div>

          <div style={styles.sidebarFooter}>
            <button type="button" onClick={onLogout} style={styles.logoutButton}>
              Çıkış Yap
            </button>

            <div style={styles.systemStatus}>
              {refreshing ? "Senkronize ediliyor" : "Canlı sistem"}
            </div>
          </div>
        </aside>

        <main style={styles.main}>
          <div style={styles.topRightStatus}>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot} />
              Sistem aktif
            </div>
          </div>

          <div style={styles.mainInner}>
            <Outlet context={{ profile, session }} />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, children, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      style={{
        ...styles.navItem,
        ...(isActive ? styles.navItemActive : null),
      }}
    >
      <span
        style={{
          ...styles.navIcon,
          ...(isActive ? styles.navIconActive : null),
        }}
      >
        {icon}
      </span>

      <span style={{ minWidth: 0 }}>{children}</span>
    </NavLink>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #0b1020 0%, #111827 18%, #f5f7fb 18%, #eef2f7 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  topProgressTrack: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    zIndex: 9999,
    background: "rgba(255,255,255,0.12)",
  },

  topProgressBar: {
    width: "24%",
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #10b981 0%, #3b82f6 100%)",
    animation: "topProgress 1.6s ease-in-out infinite",
  },

  bgGlowOne: {
    position: "absolute",
    top: "-80px",
    left: "-120px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "rgba(16,185,129,0.18)",
    filter: "blur(80px)",
    pointerEvents: "none",
  },

  bgGlowTwo: {
    position: "absolute",
    top: "60px",
    right: "-80px",
    width: "280px",
    height: "280px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.16)",
    filter: "blur(80px)",
    pointerEvents: "none",
  },

  grid: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "290px minmax(0, 1fr)",
    position: "relative",
    zIndex: 2,
  },

  sidebar: {
    minHeight: "100vh",
    background: "rgba(8,12,22,0.88)",
    backdropFilter: "blur(16px)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "22px",
  },

  brandIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    color: "#fff",
    fontWeight: 800,
    fontSize: "20px",
    flexShrink: 0,
  },

  brandTitle: {
    color: "#f8fafc",
    fontSize: "17px",
    fontWeight: 800,
  },

  brandSubtitle: {
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "3px",
  },

  profileCard: {
    display: "grid",
    gridTemplateColumns: "48px minmax(0, 1fr) 10px",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "20px",
    padding: "14px",
    marginBottom: "20px",
  },

  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.09)",
    color: "#fff",
    fontWeight: 800,
    fontSize: "18px",
    flexShrink: 0,
  },

  profileName: {
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  profileRole: {
    color: "#94a3b8",
    fontSize: "12px",
    marginTop: "4px",
  },

  liveDot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#10b981",
    animation: "pulseGlow 1.8s ease-in-out infinite",
  },

  nav: {
    display: "grid",
    gap: "10px",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    borderRadius: "16px",
    textDecoration: "none",
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.04)",
    background: "rgba(255,255,255,0.02)",
    minWidth: 0,
    boxSizing: "border-box",
  },

  navItemActive: {
    color: "#ffffff",
    background:
      "linear-gradient(135deg, rgba(16,185,129,0.20) 0%, rgba(59,130,246,0.18) 100%)",
    border: "1px solid rgba(16,185,129,0.20)",
  },

  navIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "10px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.06)",
    color: "#cbd5e1",
    fontSize: "14px",
    flexShrink: 0,
  },

  navIconActive: {
    background: "rgba(255,255,255,0.14)",
    color: "#fff",
  },

  sidebarFooter: {
    display: "grid",
    gap: "12px",
    marginTop: "24px",
  },

  logoutButton: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "16px",
    padding: "14px 16px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  systemStatus: {
    color: "#94a3b8",
    fontSize: "12px",
    textAlign: "center",
  },

  main: {
    minWidth: 0,
    width: "100%",
    padding: "26px",
    boxSizing: "border-box",
  },

  topRightStatus: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "14px",
    minWidth: 0,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.84)",
    backdropFilter: "blur(10px)",
    border: "1px solid #e5e7eb",
    fontSize: "12px",
    fontWeight: 800,
    color: "#0f172a",
    maxWidth: "100%",
    boxSizing: "border-box",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "#10b981",
    flexShrink: 0,
  },

  mainInner: {
    width: "100%",
    maxWidth: "1360px",
    minWidth: 0,
    margin: "0 auto",
    boxSizing: "border-box",
  },
};