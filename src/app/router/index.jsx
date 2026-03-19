import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../presentation/routes/ProtectedRoute";
import PublicRoute from "../../presentation/routes/PublicRoute";
import { ROUTES } from "../../shared/constants/routes";
import { canAccessRoute } from "../../shared/constants/permissions";
import AppShell from "../layouts/AppShell";

export function AppRouter({
  auth,
  onLogout,
  dashboardElement,
  salesElement,
  newSaleElement,
  productsElement,
  reportsElement,
  usersElement,
  loginElement,
}) {
  const isAuthenticated = Boolean(auth?.session);
  const loading = auth?.loading;
  const profile = auth?.profile;
  const session = auth?.session;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <PublicRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
            />
          }
        >
          <Route path={ROUTES.LOGIN} element={loginElement} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              canAccess={true}
            />
          }
        >
          <Route
            element={
              <AppShell
                session={session}
                profile={profile}
                onLogout={onLogout}
                refreshing={auth?.refreshing}
              />
            }
          >
            <Route
              path={ROUTES.DASHBOARD}
              element={
                canAccessRoute(profile, ROUTES.DASHBOARD) ? (
                  dashboardElement
                ) : (
                  <Navigate to={ROUTES.SALES} replace />
                )
              }
            />

            <Route
              path={ROUTES.SALES}
              element={
                canAccessRoute(profile, ROUTES.SALES) ? (
                  salesElement
                ) : (
                  <Navigate to={ROUTES.DASHBOARD} replace />
                )
              }
            />

            <Route
              path={ROUTES.NEW_SALE}
              element={
                canAccessRoute(profile, ROUTES.NEW_SALE) ? (
                  newSaleElement
                ) : (
                  <Navigate to={ROUTES.DASHBOARD} replace />
                )
              }
            />

            <Route
              path={ROUTES.PRODUCTS}
              element={
                canAccessRoute(profile, ROUTES.PRODUCTS) ? (
                  productsElement
                ) : (
                  <Navigate to={ROUTES.DASHBOARD} replace />
                )
              }
            />

            <Route
              path={ROUTES.REPORTS}
              element={
                canAccessRoute(profile, ROUTES.REPORTS) ? (
                  reportsElement
                ) : (
                  <Navigate to={ROUTES.DASHBOARD} replace />
                )
              }
            />

            <Route
              path={ROUTES.USERS}
              element={
                canAccessRoute(profile, ROUTES.USERS) ? (
                  usersElement
                ) : (
                  <Navigate to={ROUTES.DASHBOARD} replace />
                )
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}