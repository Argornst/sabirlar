import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../presentation/routes/ProtectedRoute";
import PublicRoute from "../../presentation/routes/PublicRoute";
import { ROUTES } from "../../shared/constants/routes";
import AppShell from "../layouts/AppShell";

import LoginPage from "../../pages/LoginPage";
import DashboardPage from "../../pages/DashboardPage";
import SalesPage from "../../pages/SalesPage";
import NewSalePage from "../../pages/NewSalePage";
import ProductsPage from "../../pages/ProductsPage";
import PriceManagementPage from "../../pages/PriceManagementPage";
import ReportsPage from "../../pages/ReportsPage";

export function AppRouter({
  auth,
  onLogout,
  dashboardElement,
  salesElement,
  newSaleElement,
  productsElement,
  priceManagementElement,
  reportsElement,
  loginElement,
}) {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <PublicRoute
              isAuthenticated={!!auth.session}
              loading={auth.loading}
            />
          }
        >
          <Route path={ROUTES.LOGIN} element={loginElement ?? <LoginPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAuthenticated={!!auth.session}
              loading={auth.loading}
            />
          }
        >
          <Route
            element={
              <AppShell
                session={auth.session}
                profile={auth.profile}
                onLogout={onLogout}
                refreshing={auth.refreshing}
              />
            }
          >
            <Route
              path={ROUTES.DASHBOARD}
              element={dashboardElement ?? <DashboardPage />}
            />
            <Route
              path={ROUTES.SALES}
              element={salesElement ?? <SalesPage />}
            />
            <Route
              path={ROUTES.NEW_SALE}
              element={newSaleElement ?? <NewSalePage />}
            />
            <Route
              path={ROUTES.PRODUCTS}
              element={productsElement ?? <ProductsPage />}
            />
            <Route
              path={ROUTES.PRICE_MANAGEMENT}
              element={priceManagementElement ?? <PriceManagementPage />}
            />
            <Route
              path={ROUTES.REPORTS}
              element={reportsElement ?? <ReportsPage />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}