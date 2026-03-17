import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../../shared/constants/routes";
import { ROLES } from "../../shared/constants/roles";

const navItems = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", icon: "◫" },
  { to: ROUTES.SALES, label: "Satışlar", icon: "▤" },
  { to: ROUTES.NEW_SALE, label: "Yeni Satış", icon: "+" },
  { to: ROUTES.PRODUCTS, label: "Ürünler", icon: "◈" },
  { to: ROUTES.PRICE_MANAGEMENT, label: "Fiyat Yönetimi", icon: "₺", adminOnly: true },
  { to: ROUTES.REPORTS, label: "Raporlar", icon: "◭" },
];

export default function AppShell({ session, profile, onLogout, refreshing = false }) {
  const roleName = profile?.roles?.name || "-";
  const isAdmin = roleName === ROLES.ADMIN;
  const fullName = profile?.full_name || session?.user?.email || "Kullanıcı";

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        @keyframes topProgress {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }

        @media (max-width: 980px) {
          .app-shell-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {refreshing && (
        <div style={styles.topProgressTrack}>
          <div style={styles.topProgressBar} />
        </div>
      )}

      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />

      <div className="app-shell-grid" style={styles.grid}>
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
              <div style={styles.avatar}>{String(fullName).charAt(0).toUpperCase()}</div>
              <div>
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

          <button onClick={onLogout} style={styles.logoutButton}>
            Çıkış Yap
          </button>
        </aside>

        <main style={styles.main}>
          <div style={styles.topRightStatus}>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot} />
              {refreshing ? "Senkronize ediliyor" : "Canlı sistem"}
            </div>
          </div>

          <div style={styles.mainInner}>
            <Outlet context={{ session, profile }} />
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
        ...(isActive ? styles.navItemActive : {}),
      }}
    >
      <span
        style={{
          ...styles.navIcon,
          ...(isActive ? styles.navIconActive : {}),
        }}
      >
        {icon}
      </span>
      <span>{children}</span>
    </NavLink>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b1020 0%, #111827 18%, #f5f7fb 18%, #eef2f7 100%)",
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
  },
  grid: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "290px 1fr",
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
    gridTemplateColumns: "48px 1fr 10px",
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
  },
  profileName: {
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
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
  },
  navItemActive: {
    color: "#ffffff",
    background: "linear-gradient(135deg, rgba(16,185,129,0.20) 0%, rgba(59,130,246,0.18) 100%)",
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
  },
  navIconActive: {
    background: "rgba(255,255,255,0.14)",
    color: "#fff",
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
  main: {
    padding: "26px",
  },
  topRightStatus: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "14px",
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
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "#10b981",
  },
  mainInner: {
    width: "100%",
  },
};