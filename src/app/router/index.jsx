import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppShell from "../layouts/AppShell";
import { useAuth } from "../providers/AppProviders";
import { ROUTES } from "../../shared/constants/routes";
import { PAGE_PERMISSION_BY_ROUTE_KEY } from "../../shared/constants/permissions";
import {
  canAccessPage,
  getFirstAccessibleRoute,
} from "../../shared/lib/permissions";

import LoginPage from "../../modules/auth/presentation/pages/LoginPage";
import DashboardPage from "../../modules/dashboard/presentation/pages/DashboardPage";
import SalesPage from "../../modules/sales/presentation/pages/SalesPage";
import NewSalePage from "../../modules/sales/presentation/pages/NewSalePage";
import ProductsPage from "../../modules/products/presentation/pages/ProductsPage";
import ReportsPage from "../../modules/reports/presentation/pages/ReportsPage";
import UsersPage from "../../modules/users/presentation/pages/UsersPage";

function FullPageLoader() {
  return (
    <div className="page-center">
      <div className="loader-card">
        <h2>Yükleniyor...</h2>
        <p>Oturum ve uygulama durumu hazırlanıyor.</p>
      </div>
    </div>
  );
}

function UnauthorizedPage() {
  return (
    <div className="page-center">
      <div className="loader-card">
        <h2>Erişim Yok</h2>
        <p>Bu sayfayı görüntüleme yetkiniz bulunmuyor.</p>
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, isAuthLoading, profile } = useAuth();

  if (isAuthLoading) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={getFirstAccessibleRoute(profile, ROUTES)}
        replace
      />
    );
  }

  return <Outlet />;
}

function PermissionRoute({ pageKey, children }) {
  const { profile, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <FullPageLoader />;
  }

  if (!canAccessPage(profile, pageKey)) {
    return <UnauthorizedPage />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <PermissionRoute pageKey={PAGE_PERMISSION_BY_ROUTE_KEY.dashboard}>
                <DashboardPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.SALES}
            element={
              <PermissionRoute pageKey={PAGE_PERMISSION_BY_ROUTE_KEY.sales}>
                <SalesPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.NEW_SALE}
            element={
              <PermissionRoute pageKey={PAGE_PERMISSION_BY_ROUTE_KEY.newSale}>
                <NewSalePage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.PRODUCTS}
            element={
              <PermissionRoute pageKey={PAGE_PERMISSION_BY_ROUTE_KEY.products}>
                <ProductsPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.REPORTS}
            element={
              <PermissionRoute pageKey={PAGE_PERMISSION_BY_ROUTE_KEY.reports}>
                <ReportsPage />
              </PermissionRoute>
            }
          />
          <Route
            path={ROUTES.USERS}
            element={
              <PermissionRoute pageKey={PAGE_PERMISSION_BY_ROUTE_KEY.users}>
                <UsersPage />
              </PermissionRoute>
            }
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to={ROUTES.DASHBOARD} replace />}
      />
    </Routes>
  );
}