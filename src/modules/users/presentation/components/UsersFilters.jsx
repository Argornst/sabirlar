import FilterBar from "../../../../shared/components/ui/FilterBar";

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
        <input
          id="users-search"
          type="text"
          placeholder="Ad, kullanıcı adı veya e-posta ara"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="users-role">Rol</label>
        <select
          id="users-role"
          className="form-select"
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
        >
          <option value="">Tüm Roller</option>
          {roles.map((roleItem) => (
            <option key={roleItem.id} value={roleItem.name}>
              {roleItem.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="users-organization">Organizasyon</label>
        <select
          id="users-organization"
          className="form-select"
          value={organization}
          onChange={(event) => onOrganizationChange(event.target.value)}
        >
          <option value="">Tüm Organizasyonlar</option>
          {organizations.map((organizationItem) => (
            <option key={organizationItem.id} value={organizationItem.id}>
              {organizationItem.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="users-status">Durum</label>
        <select
          id="users-status"
          className="form-select"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="">Tümü</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
        </select>
      </div>
    </FilterBar>
  );
}