import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../../shared/constants/routes";
import CenteredSpinner from "../components/common/CenteredSpinner";

export default function ProtectedRoute({ isAuthenticated, loading }) {
  if (loading) {
    return (
      <CenteredSpinner
        label="Oturum doğrulanıyor"
        sublabel="Kullanıcı bilgileri hazırlanıyor"
        overlay={true}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}