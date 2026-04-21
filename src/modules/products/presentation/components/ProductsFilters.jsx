import FilterBar from "../../../../shared/components/ui/FilterBar";
import Input from "../../../../shared/components/ui/Input";
import Select from "../../../../shared/components/ui/Select";

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
          <Input
            id="products-search"
            type="text"
            placeholder="Ürün adı veya birim ara"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="filter-field">
          <label htmlFor="products-status">Durum</label>
          <Select
            id="products-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="">Tümü</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </Select>
        </div>

        {actions ? (
          <div className="products-filters-row__actions">{actions}</div>
        ) : null}
      </div>
    </FilterBar>
  );
}
