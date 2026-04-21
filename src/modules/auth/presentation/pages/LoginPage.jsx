import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../app/providers/AppProviders";
import Button from "../../../../shared/components/ui/Button";
import Field from "../../../../shared/components/ui/Field";
import Input from "../../../../shared/components/ui/Input";
import { ROUTES } from "../../../../shared/constants/routes";
import AuthPageHeader from "../components/AuthPageHeader";
import { useLoginForm } from "../hooks/useLoginForm";
import "../../auth.css";

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
          <Field
            label="Kullanıcı Adı veya E-posta"
            htmlFor="login"
            error={errors.login?.message}
          >
            <Input
              id="login"
              type="text"
              placeholder="kullaniciadi veya ornek@mail.com"
              autoComplete="username"
              {...register("login")}
            />
          </Field>

          <Field label="Şifre" htmlFor="password" error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
          </Field>

          {formError ? <div className="error-text">{formError}</div> : null}

          <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
            Giriş Yap
          </Button>
        </form>
      </div>
    </div>
  );
}
