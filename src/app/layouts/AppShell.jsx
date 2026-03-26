import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
    label: "Panel",
    path: ROUTES.DASHBOARD,
    pageKey: PAGE_KEYS.DASHBOARD,
    icon: DashboardIcon,
  },
  {
    label: "Satışlar",
    path: ROUTES.SALES,
    pageKey: PAGE_KEYS.SALES,
    icon: SalesIcon,
  },
  {
    label: "Yeni Satış",
    path: ROUTES.NEW_SALE,
    pageKey: PAGE_KEYS.NEW_SALE,
    icon: PlusSquareIcon,
  },
  {
    label: "Ürünler",
    path: ROUTES.PRODUCTS,
    pageKey: PAGE_KEYS.PRODUCTS,
    icon: BoxIcon,
  },
  {
    label: "Raporlar",
    path: ROUTES.REPORTS,
    pageKey: PAGE_KEYS.REPORTS,
    icon: ChartIcon,
  },
  {
    label: "Kullanıcılar",
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
  const { profile, activeOrganization, signOut } = useAuth();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 280);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const visibleNavigationItems = useMemo(() => {
    if (profile == null) return navigationItems;
    return navigationItems.filter((item) => canAccessPage(profile, item.pageKey));
  }, [profile]);

  const fallbackRoute = getFirstAccessibleRoute(profile, ROUTES);

  const displayName =
    profile?.fullName ||
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    "Kullanıcı";

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

  function toggleSidebar() {
    setIsSidebarCollapsed((prev) => !prev);
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div
      className={`app-shell app-shell--ultra ${
        isSidebarCollapsed ? "app-shell--sidebar-collapsed" : ""
      }`}
    >
      <aside
        className={`sidebar sidebar--ultra ${
          isSidebarCollapsed ? "sidebar--collapsed" : ""
        }`}
      >
        <span className="sidebar__background-glow sidebar__background-glow--top" />
        <span className="sidebar__background-glow sidebar__background-glow--bottom" />
        <span className="sidebar__ambient sidebar__ambient--one" />
        <span className="sidebar__ambient sidebar__ambient--two" />

        <div className="sidebar__inner">
          <div className="sidebar__top">
            <div className="sidebar__header-card">
              <div className="sidebar__brand-row">
                <div className="sidebar__brand sidebar__brand--ultra">
                  <div className="sidebar__logo sidebar__logo--ultra">
                    <span className="sidebar__logo-mark">SB</span>
                  </div>

                  {!isSidebarCollapsed ? (
                    <div className="sidebar__brand-text">
                      <h1>Sabırlar</h1>
                      <p>{organizationName}</p>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="sidebar__collapse-button"
                  onClick={toggleSidebar}
                  aria-label={
                    isSidebarCollapsed ? "Menüyü genişlet" : "Menüyü daralt"
                  }
                  title={isSidebarCollapsed ? "Genişlet" : "Daralt"}
                >
                  <ChevronIcon collapsed={isSidebarCollapsed} />
                </button>
              </div>

              {!isSidebarCollapsed ? (
                <div className="sidebar__workspace-card sidebar__workspace-card--compact">
                  <span className="sidebar__workspace-label">Çalışma Alanı</span>
                  <strong>{organizationName}</strong>
                  <small>Premium satış yönetim paneli</small>
                </div>
              ) : null}
            </div>

            {!isSidebarCollapsed ? (
              <div className="sidebar__section-label">Menü</div>
            ) : null}

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
                    title={item.label}
                  >
                    <span className="sidebar__link-icon sidebar__link-icon--premium">
                      <Icon />
                    </span>

                    {!isSidebarCollapsed ? (
                      <span className="sidebar__link-label">{item.label}</span>
                    ) : null}
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

              {!isSidebarCollapsed ? (
                <div className="sidebar__user-meta">
                  <strong>{displayName}</strong>
                  <span>{roleName}</span>
                </div>
              ) : null}
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
                title="Uygulamaya Dön"
              >
                {isSidebarCollapsed ? "↩" : "Uygulamaya Dön"}
              </NavLink>
            ) : null}

            <button
              type="button"
              onClick={handleSignOut}
              className="ui-button ui-button--danger"
              title="Çıkış Yap"
            >
              {isSidebarCollapsed ? "⎋" : "Çıkış Yap"}
            </button>
          </div>
        </div>
      </aside>

      <div className="content-area">
        <header className="topbar topbar--ultra topbar--soft">
          <div className="topbar__left">
            <h2>{getPageTitle(location.pathname)}</h2>
            <p>{organizationName} paneli</p>
          </div>

          <div className="topbar__right">
            <div className="topbar__organization-chip">{organizationName}</div>
            <div className="topbar__pill topbar__pill--ultra">{roleName}</div>

            <button
              type="button"
              className="ui-button ui-button--ghost theme-toggle"
              onClick={toggleTheme}
              title={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
              aria-label={
                theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"
              }
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        <main className="page-content page-content--ultra">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <Outlet />
          </motion.div>
        </main>

        <AnimatePresence>
          {showScrollTop ? (
            <motion.button
              type="button"
              className="scroll-to-top"
              onClick={scrollToTop}
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              title="Yukarı çık"
              aria-label="Sayfanın en üstüne çık"
            >
              <ArrowUpIcon />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ArrowUpIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </svg>
  );
}

function ChevronIcon({ collapsed }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {collapsed ? (
        <path d="m9 6 6 6-6 6" />
      ) : (
        <path d="m15 6-6 6 6 6" />
      )}
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="4" width="6.5" height="9" rx="1.6" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="16" width="6.5" height="4" rx="1.6" />
    </svg>
  );
}

function SalesIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5h16" />
      <path d="M7 16v-4.5" />
      <path d="M12 16V7" />
      <path d="M17 16v-6.5" />
      <circle cx="7" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="9.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PlusSquareIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 21 8-4.5v-8L12 4 4 8.5v8L12 21Z" />
      <path d="M12 21v-8" />
      <path d="m4 8.5 8 4.5 8-4.5" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5h16" />
      <path d="M7 16v-3" />
      <path d="M12 16V8" />
      <path d="M17 16v-5" />
      <path d="m6 8 4 2.5L14 7l4 2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.5 18.5a4.5 4.5 0 0 0-9 0" />
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M18.2 18.2a3.2 3.2 0 0 0-2-2.3" />
      <path d="M16.8 5.8a2.7 2.7 0 0 1 0 5.4" />
    </svg>
  );
}