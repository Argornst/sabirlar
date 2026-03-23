import FilterBar from "../../../../shared/components/ui/FilterBar";

export default function SalesFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}) {
  return (
    <FilterBar>
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
          <option value="beklemede">beklemede</option>
          <option value="odendi">odendi</option>
          <option value="faturalandi">faturalandi</option>
          <option value="odendi_faturalandi">odendi_faturalandi</option>
        </select>
      </div>
    </FilterBar>
  );
}