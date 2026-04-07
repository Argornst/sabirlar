import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

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

import ProductionsPage from "../../modules/productions/presentation/pages/ProductionsPage";
import NewProductionPage from "../../modules/productions/presentation/pages/NewProductionPage";
import DispatchPlanPage from "../../modules/productions/presentation/pages/DispatchPlanPage";

function FullPageLoader() {
  return <div className="app-page-loader">Uygulama yükleniyor...</div>;
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
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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

            <Route path={ROUTES.PRODUCTIONS} element={<ProductionsPage />} />
            <Route path={ROUTES.NEW_PRODUCTION} element={<NewProductionPage />} />
            <Route path={ROUTES.DISPATCH_PLAN} element={<DispatchPlanPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </AnimatePresence>
  );
}