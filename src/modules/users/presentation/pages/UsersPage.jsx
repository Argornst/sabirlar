import AnimatedPage from "../../../../shared/components/ui/AnimatedPage";
import Card from "../../../../shared/components/ui/Card";
import PageHeader from "../../../../shared/components/ui/PageHeader";
import SectionCard from "../../../../shared/components/ui/SectionCard";
import EmptyState from "../../../../shared/components/ui/EmptyState";
import ErrorState from "../../../../shared/components/ui/ErrorState";
import LoadingState from "../../../../shared/components/ui/LoadingState";
import CreateUserForm from "../components/CreateUserForm";
import UsersFilters from "../components/UsersFilters";
import UsersSummaryCards from "../components/UsersSummaryCards";
import UsersTable from "../components/UsersTable";
import { useUsersListQuery } from "../hooks/useUsersListQuery";
import { useRolesQuery } from "../hooks/useRolesQuery";
import { useOrganizationsQuery } from "../hooks/useOrganizationsQuery";
import { useUsersFilters } from "../hooks/useUsersFilters";

export default function UsersPage() {
  const { data, isLoading, isError, error } = useUsersListQuery();
  const { data: roles = [] } = useRolesQuery();
  const { data: organizations = [] } = useOrganizationsQuery();
  const users = data ?? [];

  const {
    search,
    setSearch,
    role,
    setRole,
    organization,
    setOrganization,
    status,
    setStatus,
    filteredUsers,
    summary,
  } = useUsersFilters(users);

  return (
    <AnimatedPage>
      <Card>
        <PageHeader
          title="Users"
          description="Kullanıcıları oluşturun, filtreleyin ve erişimlerini yönetin."
          badge="Kullanıcı Yönetimi"
        />

        <div className="content-stack">
          <SectionCard
            title="Kullanıcı Özeti"
            description="Genel kullanıcı durumu ve rol dağılımı"
          >
            <UsersSummaryCards summary={summary} />
          </SectionCard>

          <SectionCard
            title="Yeni Kullanıcı Oluştur"
            description="Yeni kullanıcı, rol ve başlangıç izinleri tanımlayın"
          >
            <CreateUserForm />
          </SectionCard>

          <SectionCard
            title="Kullanıcı Listesi"
            description={`Filtrelenmiş ${filteredUsers.length} / toplam ${users.length} kullanıcı`}
          >
            <UsersFilters
              search={search}
              onSearchChange={setSearch}
              role={role}
              onRoleChange={setRole}
              organization={organization}
              onOrganizationChange={setOrganization}
              status={status}
              onStatusChange={setStatus}
              roles={roles}
              organizations={organizations}
            />

            {isLoading ? (
              <LoadingState
                title="Kullanıcılar yükleniyor"
                description="Kullanıcı kayıtları hazırlanıyor."
              />
            ) : null}

            {isError ? (
              <ErrorState
                title="Kullanıcı kayıtları alınamadı"
                description={error?.message || "Bir hata oluştu."}
              />
            ) : null}

            {!isLoading && !isError && !filteredUsers.length ? (
              <EmptyState
                title="Kullanıcı bulunamadı"
                description="Arama ve filtre kriterlerinize uygun kullanıcı yok."
              />
            ) : null}

            {!isLoading && !isError && filteredUsers.length ? (
              <UsersTable users={filteredUsers} />
            ) : null}
          </SectionCard>
        </div>
      </Card>
    </AnimatedPage>
  );
}