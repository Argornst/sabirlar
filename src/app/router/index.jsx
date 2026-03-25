import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppShell from "../layouts/AppShell";
import { useAuth } from "../providers/AppProviders";
import { ROUTES } from "../../shared/constants/routes";

import LoginPage from "../../modules/auth/presentation/pages/LoginPage";
import DashboardPage from "../../modules/dashboard/presentation/pages/DashboardPage";
import SalesPage from "../../modules/sales/presentation/pages/SalesPage";
import NewSalePage from "../../modules/sales/presentation/pages/NewSalePage";
import ProductsPage from "../../modules/products/presentation/pages/ProductsPage";
import ReportsPage from "../../modules/reports/presentation/pages/ReportsPage";
import UsersPage from "../../modules/users/presentation/pages/UsersPage";

function FullPageLoader() {
  return (
    <div style={{ padding: 40, color: "white" }}>
      Uygulama yükleniyor...
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
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.SALES} element={<SalesPage />} />
          <Route path={ROUTES.NEW_SALE} element={<NewSalePage />} />
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.USERS} element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}