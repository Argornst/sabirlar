import Button from "../../../../shared/components/ui/Button";
import Field from "../../../../shared/components/ui/Field";
import { useOrganizationsQuery } from "../hooks/useOrganizationsQuery";
import { useRolesQuery } from "../hooks/useRolesQuery";
import { useCreateUserForm } from "../hooks/useCreateUserForm";
import { formatRoleName } from "../../../../shared/lib/formatters";

export default function CreateUserForm() {
  const {
    register,
    onSubmit,
    formState: { errors },
    isSubmitting,
    submitError,
  } = useCreateUserForm();

  const { data: roles = [], isLoading: rolesLoading } = useRolesQuery();
  const { data: organizations = [], isLoading: organizationsLoading } =
    useOrganizationsQuery();

  return (
    <form className="form-grid form-grid--two-columns" onSubmit={onSubmit}>
      <Field label="E-posta" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          placeholder="ornek@mail.com"
          autoComplete="email"
          {...register("email")}
        />
      </Field>

      <Field
        label="Kullanıcı Adı"
        htmlFor="username"
        error={errors.username?.message}
      >
        <input
          id="username"
          type="text"
          placeholder="kullaniciadi"
          autoComplete="username"
          {...register("username")}
        />
      </Field>

      <Field label="Ad Soyad" htmlFor="fullName" error={errors.fullName?.message}>
        <input
          id="fullName"
          type="text"
          placeholder="Ad Soyad"
          autoComplete="name"
          {...register("fullName")}
        />
      </Field>

      <Field label="Şifre" htmlFor="password" error={errors.password?.message}>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register("password")}
        />
      </Field>

      <Field label="Rol" htmlFor="roleId" error={errors.roleId?.message}>
        <select id="roleId" className="form-select" {...register("roleId")}>
          <option value="">
            {rolesLoading ? "Roller yükleniyor..." : "Rol seçin"}
          </option>
          {roles.map((role) => (
  <option key={role.id} value={role.id}>
    {formatRoleName(role.name)}
  </option>
))}
        </select>
      </Field>

      <Field
        label="Organizasyon"
        htmlFor="organizationId"
        error={errors.organizationId?.message}
      >
        <select
          id="organizationId"
          className="form-select"
          {...register("organizationId")}
        >
          <option value="">
            {organizationsLoading
              ? "Organizasyonlar yükleniyor..."
              : "Organizasyon seçin"}
          </option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </Field>

      {submitError ? <div className="error-text">{submitError}</div> : null}

      <div className="form-actions">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Oluşturuluyor..." : "Kullanıcı Oluştur"}
        </Button>
      </div>
    </form>
  );
}