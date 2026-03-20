import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { ROUTES } from "../../shared/constants/routes";
import {
  canAccessRoute,
  isAdminProfile,
} from "../../shared/constants/permissions";

const navItems = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", icon: "◫" },
  { to: ROUTES.SALES, label: "Satışlar", icon: "▤" },
  { to: ROUTES.NEW_SALE, label: "Yeni Satış", icon: "+" },
  { to: ROUTES.PRODUCTS, label: "Ürünler", icon: "◈" },
  { to: ROUTES.REPORTS, label: "Raporlar", icon: "◭" },
  { to: ROUTES.USERS, label: "Kullanıcılar", icon: "◎" },
];

export default function AppShell({
  session,
  profile,
  onLogout,
  refreshing = false,
}) {
  const roleName = profile?.roles?.name || "-";
  const isAdmin = isAdminProfile(profile);
  const fullName = profile?.full_name || session?.user?.email || "Kullanıcı";

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(id);
  }, []);

  const visibleNavItems = navItems.filter((item) =>
    canAccessRoute(profile, item.to)
  );

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes topProgress {
          0% { transform: translateX(-30%); width: 18%; }
          50% { transform: translateX(180%); width: 34%; }
          100% { transform: translateX(430%); width: 18%; }
        }

        @keyframes pulseGlow {
          0% { opacity: 0.65; box-shadow: 0 0 0 rgba(16,185,129,0.00); }
          50% { opacity: 1; box-shadow: 0 0 18px rgba(16,185,129,0.42); }
          100% { opacity: 0.65; box-shadow: 0 0 0 rgba(16,185,129,0.00); }
        }

        @media (max-width: 1080px) {
          .app-shell-grid {
            grid-template-columns: 1fr !important;
          }

          .app-shell-sidebar {
            min-height: auto !important;
            position: sticky;
            top: 0;
            z-index: 20;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }

          .app-shell-main {
            padding-top: 70px !important;
          }

          .app-shell-top-status {
            top: 18px !important;
            right: 18px !important;
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

      <div
        className="app-shell-grid"
        style={{
          ...styles.grid,
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0px)" : "translateY(20px)",
          filter: ready ? "blur(0px)" : "blur(10px)",
          transition:
            "opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 520ms ease",
        }}
      >
        <aside
          className="app-shell-sidebar"
          style={{
            ...styles.sidebar,
            opacity: ready ? 1 : 0,
            transform: ready ? "translateX(0px)" : "translateX(-18px)",
            transition:
              "opacity 560ms cubic-bezier(0.22, 1, 0.36, 1), transform 560ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
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

              <div>
                <div style={styles.profileName}>{fullName}</div>
                <div style={styles.profileRole}>
                  Rol: {roleName} {isAdmin ? "• Tam yetki" : ""}
                </div>
              </div>

              <div style={styles.liveDot} />
            </div>

            <nav style={styles.nav}>
              {visibleNavItems.map((item, index) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    ...styles.navItem,
                    ...(isActive ? styles.navItemActive : {}),
                    opacity: ready ? 1 : 0,
                    transform: ready ? "translateX(0px)" : "translateX(-10px)",
                    transition: `opacity 420ms ease ${90 + index * 45}ms, transform 420ms cubic-bezier(0.22, 1, 0.36, 1) ${90 + index * 45}ms, background 180ms ease, border-color 180ms ease, box-shadow 180ms ease`,
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        style={{
                          ...styles.navActiveBar,
                          opacity: isActive ? 1 : 0,
                        }}
                      />
                      <span style={styles.navItemInner}>
                        <span
                          style={{
                            ...styles.navIcon,
                            ...(isActive ? styles.navIconActive : {}),
                          }}
                        >
                          {item.icon}
                        </span>
                        <span
                          style={{
                            ...styles.navText,
                            ...(isActive ? styles.navTextActive : {}),
                          }}
                        >
                          {item.label}
                        </span>
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <button type="button" style={styles.logoutButton} onClick={onLogout}>
            Çıkış Yap
          </button>
        </aside>

        <main
          className="app-shell-main"
          style={{
            ...styles.main,
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0px)" : "translateY(22px)",
            transition:
              "opacity 620ms cubic-bezier(0.22, 1, 0.36, 1) 120ms, transform 620ms cubic-bezier(0.22, 1, 0.36, 1) 120ms",
          }}
        >
          <div className="app-shell-top-status" style={styles.topRightStatus}>
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
    gridTemplateColumns: "280px 1fr",
    position: "relative",
    zIndex: 2,
  },
  sidebar: {
    minHeight: "100vh",
    background: "rgba(8,12,22,0.88)",
    backdropFilter: "blur(16px)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    padding: "24px 18px",
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
    flexShrink: 0,
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
    width: "100%",
  },
  navItem: {
    position: "relative",
    width: "100%",
    display: "block",
    boxSizing: "border-box",
    textDecoration: "none",
    color: "#cbd5e1",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.04)",
    background: "rgba(255,255,255,0.02)",
    overflow: "hidden",
  },
  navItemActive: {
    color: "#ffffff",
    background:
      "linear-gradient(135deg, rgba(16,185,129,0.16) 0%, rgba(59,130,246,0.18) 100%)",
    border: "1px solid rgba(59,130,246,0.18)",
    boxShadow: "0 14px 30px rgba(59,130,246,0.14)",
  },
  navActiveBar: {
    position: "absolute",
    left: "0",
    top: "12px",
    bottom: "12px",
    width: "4px",
    borderRadius: "999px",
    background: "linear-gradient(180deg, #10b981 0%, #3b82f6 100%)",
    transition: "opacity 180ms ease",
  },
  navItemInner: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "30px minmax(0, 1fr)",
    alignItems: "center",
    columnGap: "12px",
    padding: "12px 14px 12px 16px",
  },
  navIcon: {
    width: "30px",
    height: "30px",
    minWidth: "30px",
    borderRadius: "10px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.06)",
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: 800,
    transition: "background 180ms ease, color 180ms ease",
  },
  navIconActive: {
    background: "rgba(255,255,255,0.14)",
    color: "#ffffff",
  },
  navText: {
    minWidth: 0,
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.2,
  },
  navTextActive: {
    color: "#ffffff",
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
    position: "relative",
    padding: "26px",
    paddingTop: "26px",
    minWidth: 0,
    boxSizing: "border-box",
  },
  topRightStatus: {
    position: "absolute",
    top: "18px",
    right: "26px",
    zIndex: 15,
    display: "flex",
    justifyContent: "flex-end",
    pointerEvents: "none",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    border: "1px solid #e5e7eb",
    fontSize: "12px",
    fontWeight: 800,
    color: "#0f172a",
    boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
    pointerEvents: "auto",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "#10b981",
  },
  mainInner: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 8px",
    boxSizing: "border-box",
    minWidth: 0,
  },
};