import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../../shared/constants/routes";
import { PAGE_KEYS } from "../../shared/constants/permissions";
import {
  canAccessPage,
  getFirstAccessibleRoute,
} from "../../shared/lib/permissions";
import { getOrganizationDisplayName } from "../../shared/lib/tenant";
import { useAuth } from "../providers/AppProviders";

const navigationItems = [
  {
    label: "Dashboard",
    path: ROUTES.DASHBOARD,
    pageKey: PAGE_KEYS.DASHBOARD,
    icon: DashboardIcon,
  },
  {
    label: "Sales",
    path: ROUTES.SALES,
    pageKey: PAGE_KEYS.SALES,
    icon: SalesIcon,
  },
  {
    label: "New Sale",
    path: ROUTES.NEW_SALE,
    pageKey: PAGE_KEYS.NEW_SALE,
    icon: PlusSquareIcon,
  },
  {
    label: "Products",
    path: ROUTES.PRODUCTS,
    pageKey: PAGE_KEYS.PRODUCTS,
    icon: BoxIcon,
  },
  {
    label: "Reports",
    path: ROUTES.REPORTS,
    pageKey: PAGE_KEYS.REPORTS,
    icon: ChartIcon,
  },
  {
    label: "Users",
    path: ROUTES.USERS,
    pageKey: PAGE_KEYS.USERS,
    icon: UsersIcon,
  },
];

function getPageTitle(pathname) {
  const matched = navigationItems.find((item) => item.path === pathname);
  return matched?.label ?? "Panel";
}

function getInitials(value) {
  const text = String(value || "").trim();
  if (!text) return "SB";

  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export default function AppShell() {
  const { user, profile, activeOrganization, signOut } = useAuth();
  const location = useLocation();

  const visibleNavigationItems =
    profile == null
      ? navigationItems
      : navigationItems.filter((item) => canAccessPage(profile, item.pageKey));

  const fallbackRoute = getFirstAccessibleRoute(profile, ROUTES);
  const displayName = profile?.fullName || user?.email || "Bilinmeyen kullanıcı";
  const roleName = profile?.roleName || "Kullanıcı";
  const organizationName = getOrganizationDisplayName(activeOrganization, profile);
  const initials = getInitials(displayName);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      alert(error?.message || "Çıkış yapılırken hata oluştu.");
    }
  }

  return (
    <div className="app-shell app-shell--ultra">
      <aside className="sidebar sidebar--ultra">
        <span className="sidebar__background-glow sidebar__background-glow--top" />
        <span className="sidebar__background-glow sidebar__background-glow--bottom" />
        <span className="sidebar__ambient sidebar__ambient--one" />
        <span className="sidebar__ambient sidebar__ambient--two" />

        <div className="sidebar__inner">
          <div className="sidebar__top">
            <div className="sidebar__brand sidebar__brand--ultra">
              <div className="sidebar__logo sidebar__logo--ultra">SB</div>

              <div className="sidebar__brand-text">
                <h1>Sabırlar</h1>
                <p>{organizationName}</p>
              </div>
            </div>

            <div className="sidebar__workspace-card">
              <span className="sidebar__workspace-label">Workspace</span>
              <strong>{organizationName}</strong>
              <small>Premium satış paneli deneyimi</small>
            </div>

            <div className="sidebar__section-label">Navigation</div>

            <nav className="sidebar__nav">
              {visibleNavigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar__link${isActive ? " sidebar__link--active" : ""}`
                    }
                  >
                    <span className="sidebar__link-icon">
                      <Icon />
                    </span>

                    <span className="sidebar__link-label">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="sidebar__footer">
            <div className="sidebar__user-card sidebar__user-card--ultra">
              <div className="sidebar__user-avatar sidebar__user-avatar--ultra">
                {initials}
              </div>

              <div className="sidebar__user-meta">
                <strong>{displayName}</strong>
                <span>{roleName}</span>
              </div>
            </div>

            {!visibleNavigationItems.length ? (
              <NavLink
                to={fallbackRoute}
                className="ui-button ui-button--primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                Uygulamaya Dön
              </NavLink>
            ) : null}

            <button
              type="button"
              onClick={handleSignOut}
              className="ui-button ui-button--danger"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>

      <div className="content-area">
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

function DashboardIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 13.5h6.5V20H4v-6.5Z" />
      <path d="M13.5 4H20v9h-6.5V4Z" />
      <path d="M13.5 16H20v4h-6.5v-4Z" />
      <path d="M4 4h6.5v6.5H4V4Z" />
    </svg>
  );
}

function SalesIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19V9" />
      <path d="M12 19V5" />
      <path d="M19 19v-7" />
      <path d="M3 19.5h18" />
    </svg>
  );
}

function PlusSquareIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 12h8" />
      <path d="M12 8v8" />
      <path d="M8 3.5h8c3 0 4.5 1.5 4.5 4.5v8c0 3-1.5 4.5-4.5 4.5H8c-3 0-4.5-1.5-4.5-4.5V8c0-3 1.5-4.5 4.5-4.5Z" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21V12" />
      <path d="M20 8.5v7L12 20l-8-4.5v-7" />
      <path d="m4 8.5 8 4.5 8-4.5" />
      <path d="m8 4 8 4.5-4 2.25-8-4.5L8 4Z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5h16" />
      <path d="M7 16v-4" />
      <path d="M12 16V6" />
      <path d="M17 16v-7" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 19a4 4 0 0 0-8 0" />
      <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19 19a3 3 0 0 0-2.2-2.9" />
      <path d="M17.5 5.5a3 3 0 0 1 0 5.9" />
    </svg>
  );
}