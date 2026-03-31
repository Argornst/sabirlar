import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ROUTES } from "../../shared/constants/routes";
import { PAGE_KEYS } from "../../shared/constants/permissions";
import {
  canAccessPage,
  getFirstAccessibleRoute,
} from "../../shared/lib/permissions";
import { getOrganizationDisplayName } from "../../shared/lib/tenant";
import { useAuth } from "../providers/AppProviders";
import { useCurrentOrganization } from "../../modules/users/presentation/hooks/useCurrentOrganization";

const navigationItems = [
  {
    label: "Panel",
    description: "Dashboard ve genel görünüm",
    path: ROUTES.DASHBOARD,
    pageKey: PAGE_KEYS.DASHBOARD,
    icon: DashboardIcon,
    keywords: ["dashboard", "panel", "genel", "anasayfa"],
  },
  {
    label: "Satışlar",
    description: "Satış kayıtlarını görüntüle",
    path: ROUTES.SALES,
    pageKey: PAGE_KEYS.SALES,
    icon: SalesIcon,
    keywords: ["satis", "satış", "sales", "kayit", "liste"],
  },
  {
    label: "Yeni Satış",
    description: "Yeni satış oluştur",
    path: ROUTES.NEW_SALE,
    pageKey: PAGE_KEYS.NEW_SALE,
    icon: PlusSquareIcon,
    keywords: ["yeni", "satis", "satış", "ekle", "olustur", "oluştur"],
  },
  {
    label: "Ürünler",
    description: "Ürünleri yönet",
    path: ROUTES.PRODUCTS,
    pageKey: PAGE_KEYS.PRODUCTS,
    icon: BoxIcon,
    keywords: ["urun", "ürün", "products", "stok"],
  },
  {
    label: "Raporlar",
    description: "Rapor ve analiz ekranı",
    path: ROUTES.REPORTS,
    pageKey: PAGE_KEYS.REPORTS,
    icon: ChartIcon,
    keywords: ["rapor", "reports", "analiz"],
  },
  {
    label: "Kullanıcılar",
    description: "Kullanıcı ve yetki yönetimi",
    path: ROUTES.USERS,
    pageKey: PAGE_KEYS.USERS,
    icon: UsersIcon,
    keywords: ["kullanici", "kullanıcı", "users", "yetki"],
  },
];

const actionItems = [
  {
    id: "action-new-sale",
    type: "action",
    label: "Yeni satış oluştur",
    description: "Yeni satış ekranını aç",
    icon: PlusSquareIcon,
    keywords: ["yeni", "satış", "oluştur", "ekle", "new sale"],
    run: ({ navigate }) => navigate(ROUTES.NEW_SALE),
  },
  {
    id: "action-toggle-theme",
    type: "action",
    label: "Temayı değiştir",
    description: "Koyu ve açık tema arasında geçiş yap",
    icon: ThemeIcon,
    keywords: ["tema", "theme", "dark", "light", "mod"],
    run: ({ toggleTheme }) => toggleTheme(),
  },
  {
    id: "action-toggle-sidebar",
    type: "action",
    label: "Menüyü daralt / genişlet",
    description: "Sidebar görünümünü değiştir",
    icon: SidebarIcon,
    keywords: ["sidebar", "menü", "menu", "daralt", "genişlet"],
    run: ({ toggleSidebar }) => toggleSidebar(),
  },
  {
    id: "action-scroll-top",
    type: "action",
    label: "Sayfanın başına git",
    description: "Ekranı yumuşak şekilde yukarı kaydır",
    icon: ArrowUpIcon,
    keywords: ["yukarı", "başa", "scroll", "top"],
    run: ({ scrollToTop }) => scrollToTop(),
  },
  {
    id: "action-sign-out",
    type: "action",
    label: "Çıkış yap",
    description: "Oturumu kapat",
    icon: LogoutIcon,
    keywords: ["çıkış", "logout", "sign out", "oturumu kapat"],
    run: async ({ handleSignOut }) => {
      await handleSignOut();
    },
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

function normalizeForSearch(value) {
  return String(value || "")
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

function fuzzyMatchScore(query, text) {
  const q = normalizeForSearch(query);
  const t = normalizeForSearch(text);

  if (!q) return 1;
  if (!t) return -1;

  if (t.includes(q)) {
    return 1000 - t.indexOf(q) * 2 - (t.length - q.length);
  }

  let qi = 0;
  let lastMatchIndex = -1;
  let score = 0;
  let consecutive = 0;

  for (let ti = 0; ti < t.length && qi < q.length; ti += 1) {
    if (t[ti] === q[qi]) {
      score += 10;

      if (lastMatchIndex === ti - 1) {
        consecutive += 1;
        score += 8 + consecutive * 2;
      } else {
        consecutive = 0;
      }

      if (ti === 0 || " /-_".includes(t[ti - 1])) {
        score += 12;
      }

      lastMatchIndex = ti;
      qi += 1;
    }
  }

  if (qi !== q.length) return -1;

  score -= Math.max(0, t.length - q.length);
  return score;
}

function getPaletteScore(query, item) {
  const fields = [
    { value: item.label, weight: 1.4 },
    { value: item.description, weight: 1.0 },
    ...((item.keywords || []).map((keyword) => ({
      value: keyword,
      weight: 1.15,
    }))),
  ];

  let best = -1;

  for (const field of fields) {
    const fieldScore = fuzzyMatchScore(query, field.value);
    if (fieldScore >= 0) {
      best = Math.max(best, fieldScore * field.weight);
    }
  }

  return best;
}

export default function AppShell() {
  const { signOut, user } = useAuth();
  const {
    profile,
    organization: activeOrganization,
    isLoading: isProfileLoading,
  } = useCurrentOrganization();

  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);
  const paletteInputRef = useRef(null);

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
    if (isProfileLoading || profile == null) {
      return navigationItems;
    }

    return navigationItems.filter((item) => canAccessPage(profile, item.pageKey));
  }, [profile, isProfileLoading]);

  const groupedPaletteResults = useMemo(() => {
    const routeItems = visibleNavigationItems.map((item) => ({
      ...item,
      type: "route",
      group: "Sayfalar",
    }));

    const quickActionItems = actionItems.map((item) => ({
      ...item,
      group: "Hızlı İşlemler",
    }));

    const combinedItems = [...routeItems, ...quickActionItems];
    const normalizedQuery = normalizeForSearch(paletteQuery);

    const filteredItems = !normalizedQuery
      ? combinedItems
      : combinedItems
          .map((item) => ({
            item,
            score: getPaletteScore(normalizedQuery, item),
          }))
          .filter((entry) => entry.score >= 0)
          .sort((a, b) => b.score - a.score)
          .map((entry) => entry.item);

    const groups = [
      {
        label: "Sayfalar",
        items: filteredItems.filter((item) => item.group === "Sayfalar"),
      },
      {
        label: "Hızlı İşlemler",
        items: filteredItems.filter((item) => item.group === "Hızlı İşlemler"),
      },
    ].filter((group) => group.items.length > 0);

    return groups;
  }, [paletteQuery, visibleNavigationItems]);

  const flatPaletteItems = useMemo(() => {
    return groupedPaletteResults.flatMap((group) => group.items);
  }, [groupedPaletteResults]);

  useEffect(() => {
    setActiveCommandIndex(0);
  }, [paletteQuery, isPaletteOpen]);

  useEffect(() => {
    function handleKeyDown(event) {
      const isOpenShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (isOpenShortcut) {
        event.preventDefault();
        setIsPaletteOpen((prev) => !prev);
        return;
      }

      if (!isPaletteOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closePalette();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveCommandIndex((prev) =>
          Math.min(prev + 1, Math.max(flatPaletteItems.length - 1, 0))
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveCommandIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (event.key === "Enter") {
        if (!flatPaletteItems.length) return;
        event.preventDefault();
        runPaletteCommand(flatPaletteItems[activeCommandIndex]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPaletteOpen, activeCommandIndex, flatPaletteItems]);

  useEffect(() => {
    if (!isPaletteOpen) return;

    const timeoutId = window.setTimeout(() => {
      paletteInputRef.current?.focus();
    }, prefersReducedMotion ? 0 : 10);

    return () => window.clearTimeout(timeoutId);
  }, [isPaletteOpen, prefersReducedMotion]);

  const fallbackRoute = getFirstAccessibleRoute(profile, ROUTES);

  const displayName =
    profile?.fullName ||
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "Kullanıcı";

  const roleName = profile?.roleName || "Kullanıcı";
  const organizationName =
    getOrganizationDisplayName(activeOrganization, profile) || "Sabırlar";
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
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  function closePalette() {
    setIsPaletteOpen(false);
    setPaletteQuery("");
    setActiveCommandIndex(0);
  }

  async function runPaletteCommand(item) {
    if (!item) return;

    if (item.type === "route" && item.path) {
      navigate(item.path);
      closePalette();
      return;
    }

    if (item.type === "action" && typeof item.run === "function") {
      await item.run({
        navigate,
        toggleTheme,
        toggleSidebar,
        scrollToTop,
        handleSignOut,
      });
      closePalette();
    }
  }

  const pageTransitionProps = prefersReducedMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.18, ease: "easeOut" },
      };

  const scrollButtonTransitionProps = prefersReducedMotion
    ? {
        initial: { opacity: 1, y: 0, scale: 1 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 12, scale: 0.92 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 12, scale: 0.92 },
        transition: { duration: 0.14, ease: "easeOut" },
      };

  const paletteBackdropTransitionProps = prefersReducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.12, ease: "easeOut" },
      };

  const palettePanelTransitionProps = prefersReducedMotion
    ? {
        initial: { opacity: 1, y: 0, scale: 1 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 10, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.985 },
        transition: { duration: 0.14, ease: "easeOut" },
      };

  let runningIndex = -1;

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
            <button
              type="button"
              className="command-palette-trigger"
              onClick={() => setIsPaletteOpen(true)}
              title="Komut paleti"
              aria-label="Komut paleti"
            >
              <SearchIcon />
              <span>Hızlı Git</span>
              <kbd>Ctrl K</kbd>
            </button>

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
          <motion.div key={location.pathname} {...pageTransitionProps}>
            <Outlet />
          </motion.div>
        </main>

        <AnimatePresence>
          {showScrollTop ? (
            <motion.button
              type="button"
              className="scroll-to-top"
              onClick={scrollToTop}
              {...scrollButtonTransitionProps}
              title="Yukarı çık"
              aria-label="Sayfanın en üstüne çık"
            >
              <ArrowUpIcon />
            </motion.button>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {isPaletteOpen ? (
            <motion.div
              className="command-palette-backdrop"
              {...paletteBackdropTransitionProps}
              onClick={closePalette}
            >
              <motion.div
                className="command-palette"
                {...palettePanelTransitionProps}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="command-palette__header">
                  <SearchIcon />
                  <input
                    ref={paletteInputRef}
                    type="text"
                    value={paletteQuery}
                    onChange={(event) => setPaletteQuery(event.target.value)}
                    placeholder="Sayfa veya işlem ara..."
                    className="command-palette__input"
                  />
                  <button
                    type="button"
                    className="command-palette__close"
                    onClick={closePalette}
                    aria-label="Komut paletini kapat"
                  >
                    ESC
                  </button>
                </div>

                <div className="command-palette__results">
                  {groupedPaletteResults.length ? (
                    groupedPaletteResults.map((group) => (
                      <div key={group.label} className="command-palette__group">
                        <div className="command-palette__group-label">
                          {group.label}
                        </div>

                        <div className="command-palette__group-items">
                          {group.items.map((item) => {
                            runningIndex += 1;
                            const currentIndex = runningIndex;
                            const Icon = item.icon;
                            const isActive = currentIndex === activeCommandIndex;
                            const itemKey =
                              item.type === "route"
                                ? item.path
                                : item.id || `${item.label}-${currentIndex}`;

                            return (
                              <button
                                key={itemKey}
                                type="button"
                                className={`command-palette__item${
                                  isActive ? " command-palette__item--active" : ""
                                }`}
                                onMouseEnter={() =>
                                  setActiveCommandIndex(currentIndex)
                                }
                                onClick={() => runPaletteCommand(item)}
                              >
                                <span className="command-palette__item-icon">
                                  <Icon />
                                </span>

                                <span className="command-palette__item-content">
                                  <strong>{item.label}</strong>
                                  <span>{item.description}</span>
                                </span>

                                <span className="command-palette__item-hint">
                                  {item.type === "action" ? "Çalıştır" : "Git"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="command-palette__empty">
                      Sonuç bulunamadı
                    </div>
                  )}
                </div>

                <div className="command-palette__footer">
                  <div className="command-palette__shortcuts">
                    <span>
                      <kbd>↑</kbd>
                      <kbd>↓</kbd>
                      gezin
                    </span>
                    <span>
                      <kbd>Enter</kbd>
                      seç
                    </span>
                    <span>
                      <kbd>Esc</kbd>
                      kapat
                    </span>
                    <span>
                      <kbd>Ctrl</kbd>
                      <kbd>K</kbd>
                      aç
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </svg>
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

function ThemeIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" />
    </svg>
  );
}

function SidebarIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="4" width="6" height="16" rx="2" />
      <rect x="11.5" y="4" width="9" height="16" rx="2" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 20H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h3" />
      <path d="M15 8.5 19 12l-4 3.5" />
      <path d="M19 12H9" />
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