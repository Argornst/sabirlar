import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../../shared/constants/routes";
import { PAGE_KEYS } from "../../shared/constants/permissions";
import { getFirstAccessibleRoute } from "../../shared/lib/permissions";
import { getOrganizationDisplayName } from "../../shared/lib/tenant";
import { useAuth } from "../providers/AppProviders";
import { canAccessPage } from "../../shared/lib/permissions";

const navigationItems = [
  { label: "Dashboard", path: ROUTES.DASHBOARD, pageKey: PAGE_KEYS.DASHBOARD },
  { label: "Sales", path: ROUTES.SALES, pageKey: PAGE_KEYS.SALES },
  { label: "New Sale", path: ROUTES.NEW_SALE, pageKey: PAGE_KEYS.NEW_SALE },
  { label: "Products", path: ROUTES.PRODUCTS, pageKey: PAGE_KEYS.PRODUCTS },
  { label: "Reports", path: ROUTES.REPORTS, pageKey: PAGE_KEYS.REPORTS },
  { label: "Users", path: ROUTES.USERS, pageKey: PAGE_KEYS.USERS },
];

function getPageTitle(pathname) {
  const matched = navigationItems.find((item) => item.path === pathname);
  return matched?.label ?? "Panel";
}

export default function AppShell() {
  const { user, profile, activeOrganization, signOut } = useAuth();
  const location = useLocation();

const visibleNavigationItems =
  profile == null
    ? navigationItems
    : navigationItems.filter((item) =>
        canAccessPage(profile, item.pageKey)
      );

  const fallbackRoute = getFirstAccessibleRoute(profile, ROUTES);
  const displayName = profile?.fullName || user?.email || "Bilinmeyen kullanıcı";
  const roleName = profile?.roleName || "Kullanıcı";
  const organizationName = getOrganizationDisplayName(activeOrganization, profile);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      alert(error?.message || "Çıkış yapılırken hata oluştu.");
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        minHeight: "100vh",
        background: "#07101d",
        color: "#ecf2ff",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid rgba(255,255,255,0.08)",
          padding: "20px",
          background: "#0a1426",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 800 }}>Sabırlar</div>
          <div style={{ marginTop: "6px", color: "#90a0be", fontSize: "14px" }}>
            {organizationName}
          </div>
        </div>

        <div style={{ color: "#90a0be", fontSize: "12px", fontWeight: 700 }}>
          Navigation
        </div>

        <nav style={{ display: "grid", gap: "8px" }}>
          {visibleNavigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: "block",
                padding: "12px 14px",
                borderRadius: "12px",
                background: isActive ? "rgba(59,130,246,0.18)" : "transparent",
                border: isActive
                  ? "1px solid rgba(96,165,250,0.24)"
                  : "1px solid transparent",
                color: "#ecf2ff",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: "auto", display: "grid", gap: "12px" }}>
          <div
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontWeight: 700 }}>{displayName}</div>
            <div style={{ marginTop: "4px", color: "#90a0be", fontSize: "13px" }}>
              {roleName}
            </div>
          </div>

          {!visibleNavigationItems.length ? (
            <NavLink
              to={fallbackRoute}
              style={{
                display: "block",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(59,130,246,0.18)",
                border: "1px solid rgba(96,165,250,0.24)",
                color: "#ecf2ff",
              }}
            >
              Uygulamaya Dön
            </NavLink>
          ) : null}

          <button
            type="button"
            onClick={handleSignOut}
            style={{
              minHeight: "44px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #ef4444, #f87171)",
              color: "white",
              fontWeight: 700,
            }}
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      <div style={{ minWidth: 0 }}>
        <header
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "#0b1424",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: 800 }}>
            {getPageTitle(location.pathname)}
          </div>
          <div style={{ marginTop: "8px", color: "#90a0be", fontSize: "14px" }}>
            {organizationName} paneli
          </div>
        </header>

        <main style={{ padding: "28px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}