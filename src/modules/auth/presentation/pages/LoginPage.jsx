import { Navigate } from "react-router-dom";
import { ROUTES } from "../../../../shared/constants/routes";
import { useAuth } from "../../../../app/providers/AppProviders";
import { useLoginForm } from "../hooks/useLoginForm";
import AuthPageHeader from "../components/AuthPageHeader";

export default function LoginPage() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { register, errors, isSubmitting, formError, onSubmit } = useLoginForm();

  if (isAuthLoading) {
    return (
      <div className="page-center">
        <div className="loader-card">
          <h2>Yükleniyor...</h2>
          <p>Oturum kontrol ediliyor.</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="page-center">
      <div className="auth-card">
        <AuthPageHeader />

        <form className="form-grid" onSubmit={onSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="login">Kullanıcı Adı veya E-posta</label>
            <input
              id="login"
              type="text"
              placeholder="kullaniciadi veya ornek@mail.com"
              autoComplete="username"
              {...register("login")}
            />
            {errors.login ? (
              <div className="error-text">{errors.login.message}</div>
            ) : null}
          </div>

          <div className="form-field">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password ? (
              <div className="error-text">{errors.password.message}</div>
            ) : null}
          </div>

          {formError ? <div className="error-text">{formError}</div> : null}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}