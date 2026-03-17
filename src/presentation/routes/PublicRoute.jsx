import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../../shared/constants/routes";
import CenteredSpinner from "../components/common/CenteredSpinner";

export default function PublicRoute({ isAuthenticated, loading }) {
  if (loading) {
    return (
      <CenteredSpinner
        label="Kontrol ediliyor"
        sublabel="Oturum durumu doğrulanıyor"
        overlay={true}
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}