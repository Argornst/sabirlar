import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../../shared/constants/routes";
import CenteredSpinner from "../components/common/CenteredSpinner";

export default function ProtectedRoute({
  isAuthenticated,
  loading,
  canAccess = true,
}) {
  const location = useLocation();

  if (loading) {
    return <CenteredSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!canAccess) {
    return <Navigate to={ROUTES.DASHBOARD} replace state={{ from: location }} />;
  }

  return <Outlet />;
}