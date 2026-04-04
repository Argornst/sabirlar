import FilterBar from "../../../../shared/components/ui/FilterBar";

export default function ProductsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  actions = null,
}) {
  return (
    <FilterBar>
      <div className="products-filters-row">
        <div className="filter-field">
          <label htmlFor="products-search">Ara</label>
          <input
            id="products-search"
            type="text"
            placeholder="Ürün adı veya birim ara"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="products-status">Durum</label>
          <select
            id="products-status"
            className="form-select"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="">Tümü</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>

        {actions ? (
          <div className="products-filters-row__actions">
            {actions}
          </div>
        ) : null}
      </div>
    </FilterBar>
  );
}