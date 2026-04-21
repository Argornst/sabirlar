import FilterBar from "../../../../shared/components/ui/FilterBar";
import Input from "../../../../shared/components/ui/Input";
import Select from "../../../../shared/components/ui/Select";

export default function UsersFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  organization,
  onOrganizationChange,
  status,
  onStatusChange,
  roles = [],
  organizations = [],
}) {
  return (
    <FilterBar>
      <div className="filter-field">
        <label htmlFor="users-search">Ara</label>
        <Input
          id="users-search"
          type="text"
          placeholder="Ad, kullanıcı adı veya e-posta ara"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="users-role">Rol</label>
        <Select
          id="users-role"
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
        >
          <option value="">Tüm Roller</option>
          {roles.map((roleItem) => (
            <option key={roleItem.id} value={roleItem.name}>
              {roleItem.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="filter-field">
        <label htmlFor="users-organization">Organizasyon</label>
        <Select
          id="users-organization"
          value={organization}
          onChange={(event) => onOrganizationChange(event.target.value)}
        >
          <option value="">Tüm Organizasyonlar</option>
          {organizations.map((organizationItem) => (
            <option key={organizationItem.id} value={organizationItem.id}>
              {organizationItem.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="filter-field">
        <label htmlFor="users-status">Durum</label>
        <Select
          id="users-status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="">Tümü</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
        </Select>
      </div>
    </FilterBar>
  );
}
