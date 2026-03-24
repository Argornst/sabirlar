import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../../shared/constants/routes";
import { PAGE_KEYS } from "../../shared/constants/permissions";
import {
  canAccessPage,
  getFirstAccessibleRoute,
} from "../../shared/lib/permissions";
import {
  getOrganizationDisplayName,
  getOrganizationDisplaySubtitle,
} from "../../shared/lib/tenant";
import { useAuth } from "../providers/AppProviders";

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="nav-icon">
      <path d="M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7V11h-7v9Zm0-18v7h7V2h-7Z" />
    </svg>
  );
}

function IconSales() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="nav-icon">
      <path d="M4 19h16M7 16l3-4 3 2 4-6" />
    </svg>
  );
}

function IconNewSale() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="nav-icon">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconProducts() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="nav-icon">
      <path d="M12 3 4 7l8 4 8-4-8-4ZM4 12l8 4 8-4M4 17l8 4 8-4" />
    </svg>
  );
}

function IconReports() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="nav-icon">
      <path d="M5 19V9M12 19V5M19 19v-8" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="nav-icon">
      <path d="M16 19a4 4 0 0 0-8 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 7a4 4 0 0 0-3-3.87M17 4.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const navigationItems = [
  {
    label: "Dashboard",
    path: ROUTES.DASHBOARD,
    pageKey: PAGE_KEYS.DASHBOARD,
    icon: <IconDashboard />,
  },
  {
    label: "Sales",
    path: ROUTES.SALES,
    pageKey: PAGE_KEYS.SALES,
    icon: <IconSales />,
  },
  {
    label: "New Sale",
    path: ROUTES.NEW_SALE,
    pageKey: PAGE_KEYS.NEW_SALE,
    icon: <IconNewSale />,
  },
  {
    label: "Products",
    path: ROUTES.PRODUCTS,
    pageKey: PAGE_KEYS.PRODUCTS,
    icon: <IconProducts />,
  },
  {
    label: "Reports",
    path: ROUTES.REPORTS,
    pageKey: PAGE_KEYS.REPORTS,
    icon: <IconReports />,
  },
  {
    label: "Users",
    path: ROUTES.USERS,
    pageKey: PAGE_KEYS.USERS,
    icon: <IconUsers />,
  },
];

function getPageTitle(pathname) {
  const matched = navigationItems.find((item) => item.path === pathname);
  return matched?.label ?? "Panel";
}

export default function AppShell() {
  const { user, profile, activeOrganization, signOut } = useAuth();
  const location = useLocation();

  const visibleNavigationItems = navigationItems.filter((item) =>
    canAccessPage(profile, item.pageKey)
  );

  const fallbackRoute = getFirstAccessibleRoute(profile, ROUTES);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      alert(error?.message || "Çıkış yapılırken hata oluştu.");
    }
  }

  const displayName = profile?.fullName || user?.email || "Bilinmeyen kullanıcı";
  const roleName = profile?.roleName || "Kullanıcı";
  const avatarLetter = displayName.slice(0, 1).toUpperCase();
  const organizationName = getOrganizationDisplayName(activeOrganization, profile);
  const organizationSubtitle = getOrganizationDisplaySubtitle(
    activeOrganization,
    profile
  );

  return (
    <div className="app-shell app-shell--ultra">
      <aside className="sidebar sidebar--ultra">
        <div className="sidebar__ambient sidebar__ambient--one" />
        <div className="sidebar__ambient sidebar__ambient--two" />

        <div className="sidebar__inner">
          <div className="sidebar__top">
            <div className="sidebar__brand sidebar__brand--ultra">
              <div className="sidebar__logo sidebar__logo--ultra">S</div>

              <div className="sidebar__brand-text">
                <h1>Sabırlar</h1>
                <p>{organizationName}</p>
              </div>
            </div>

            <div className="sidebar__workspace-card">
              <span className="sidebar__workspace-label">Workspace</span>
              <strong>{organizationName}</strong>
              <small>{organizationSubtitle}</small>
            </div>

            <div className="sidebar__section-label">Navigation</div>

            <nav className="sidebar__nav">
              {visibleNavigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? "sidebar__link sidebar__link--active"
                      : "sidebar__link"
                  }
                >
                  <span className="sidebar__link-icon">{item.icon}</span>
                  <span className="sidebar__link-label">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="sidebar__footer">
            <div className="sidebar__user-card sidebar__user-card--ultra">
              <div className="sidebar__user-avatar sidebar__user-avatar--ultra">
                {avatarLetter}
              </div>

              <div className="sidebar__user-meta">
                <strong>{displayName}</strong>
                <span>{roleName}</span>
              </div>
            </div>

            {!visibleNavigationItems.length ? (
              <NavLink
                to={fallbackRoute}
                className="sidebar__link sidebar__link--active"
              >
                <span className="sidebar__link-label">Uygulamaya Dön</span>
              </NavLink>
            ) : null}

            <button type="button" className="danger-button" onClick={handleSignOut}>
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>

      <div className="content-area content-area--ultra">
        <header className="topbar topbar--ultra">
          <div className="topbar__left">
            <h2>{getPageTitle(location.pathname)}</h2>
            <p>{organizationName} paneli</p>
          </div>

          <div className="topbar__right">
            <div className="topbar__organization-chip">{organizationName}</div>
            <div className="topbar__pill topbar__pill--ultra">{roleName}</div>
          </div>
        </header>

        <main className="page-content page-content--ultra">
          <Outlet />
        </main>
      </div>
    </div>
  );
}