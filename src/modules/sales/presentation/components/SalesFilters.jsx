import FilterBar from "../../../../shared/components/ui/FilterBar";

export default function SalesFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  actions = null,
}) {
  return (
    <FilterBar>
      <div className="sales-filters">
        <div className="sales-filters__fields">
          <div className="filter-field">
            <label htmlFor="sales-search">Ara</label>
            <input
              id="sales-search"
              type="text"
              placeholder="Müşteri veya ürün ara"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="sales-status">Durum</label>
            <select
              id="sales-status"
              className="form-select"
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
            >
              <option value="">Tümü</option>
              <option value="beklemede">Beklemede</option>
              <option value="odendi">Ödendi</option>
              <option value="faturalandi">Faturalandı</option>
              <option value="odendi_faturalandi">Tamamlandı</option>
            </select>
          </div>
        </div>

        {actions ? <div className="sales-filters__actions">{actions}</div> : null}
      </div>
    </FilterBar>
  );
}